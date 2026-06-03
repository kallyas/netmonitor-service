from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.urls import reverse
from django.core.management import call_command
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Device, StatusReport

class DeviceModelTest(TestCase):
    def setUp(self):
        self.device = Device.objects.create(
            name="Core Router Alpha",
            device_type="ROUTER",
            ip_address="192.168.10.1",
            location="Kampala HQ Data Center"
        )

    def test_new_device_is_stale_by_default(self):
        """A newly registered device with no status reports should evaluate as stale."""
        self.assertTrue(self.device.is_stale)
        self.assertEqual(self.device.current_status, "OFFLINE")

    def test_device_not_stale_on_recent_report(self):
        """A device with a fresh status report (under 15 mins) should not be stale."""
        StatusReport.objects.create(
            device=self.device,
            status="ONLINE",
            timestamp=timezone.now() - timedelta(minutes=5)
        )
        
        self.device.current_status = "ONLINE"
        self.device.last_reported_at = timezone.now() - timedelta(minutes=5)
        self.device.save()

        self.assertFalse(self.device.is_stale)

    def test_device_becomes_stale_after_15_minutes(self):
        """A device becomes stale if its last report timestamp is older than 15 minutes."""
        self.device.current_status = "ONLINE"
        self.device.last_reported_at = timezone.now() - timedelta(minutes=16)
        self.device.save()

        self.assertTrue(self.device.is_stale)


class DeviceAPITest(APITestCase):
    def setUp(self):
        self.device = Device.objects.create(
            name="Edge Switch Beta",
            device_type="SWITCH",
            ip_address="10.0.0.5",
            location="Entebbe Branch"
        )
        self.list_url = reverse('device-list')
        self.report_url = reverse('device-report', kwargs={'pk': self.device.id})
        self.history_url = reverse('device-history', kwargs={'pk': self.device.id})

    def test_submit_status_report_updates_cache(self):
        """Posting to the report endpoint logs a history entry and mirrors state onto the device."""
        payload = {"status": "DEGRADED", "message": "High packet loss on uplink"}
        response = self.client.post(self.report_url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify parent caching
        self.device.refresh_from_db()
        self.assertEqual(self.device.current_status, "DEGRADED")
        self.assertIsNotNone(self.device.last_reported_at)

    def test_register_device_rejects_invalid_payload(self):
        """Device registration should reject invalid types, invalid IPs, and missing fields."""
        payload = {
            "name": "",
            "device_type": "MODEM",
            "ip_address": "not-an-ip-address",
        }

        response = self.client.post(self.list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Device.objects.count(), 1)
        self.assertIn("name", response.data)
        self.assertIn("device_type", response.data)
        self.assertIn("ip_address", response.data)
        self.assertIn("location", response.data)

    def test_register_device_ignores_read_only_state_fields(self):
        """Clients must not be able to set cached status fields during registration."""
        payload = {
            "name": "Unauthorized Cache Override",
            "device_type": "ROUTER",
            "ip_address": "192.168.50.1",
            "location": "Lab Rack",
            "current_status": "ONLINE",
            "last_reported_at": timezone.now().isoformat(),
        }

        response = self.client.post(self.list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        device = Device.objects.get(id=response.data["id"])
        self.assertEqual(device.current_status, "OFFLINE")
        self.assertIsNone(device.last_reported_at)
        self.assertTrue(device.is_stale)

    def test_submit_status_report_rejects_invalid_status(self):
        """Invalid status reports should not create history or mutate the device cache."""
        response = self.client.post(
            self.report_url,
            {"status": "UNKNOWN", "message": "Bad status value"},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)
        self.assertEqual(StatusReport.objects.count(), 0)

        self.device.refresh_from_db()
        self.assertEqual(self.device.current_status, "OFFLINE")
        self.assertIsNone(self.device.last_reported_at)

    def test_submit_status_report_rejects_missing_status(self):
        """A report without a status should fail validation and leave state unchanged."""
        response = self.client.post(
            self.report_url,
            {"message": "Missing status"},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)
        self.assertEqual(StatusReport.objects.count(), 0)

        self.device.refresh_from_db()
        self.assertEqual(self.device.current_status, "OFFLINE")
        self.assertIsNone(self.device.last_reported_at)

    def test_submit_status_report_for_unknown_device_returns_not_found(self):
        """Reports for unknown devices should return 404 instead of creating orphan history."""
        url = reverse('device-report', kwargs={'pk': 999999})
        response = self.client.post(url, {"status": "ONLINE"}, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(StatusReport.objects.count(), 0)

    def test_history_endpoint_limits_to_twenty_records(self):
        """The history view must never return more than the 20 most recent logs."""
        for i in range(25):
            StatusReport.objects.create(
                device=self.device,
                status="ONLINE",
                message=f"Heartbeat stream index {i}"
            )
            
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 20)

    def test_history_for_unknown_device_returns_not_found(self):
        """History lookup for an unknown device should fail clearly."""
        url = reverse('device-history', kwargs={'pk': 999999})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class SeedDataCommandTest(TestCase):
    def test_seed_data_is_idempotent(self):
        """Running the seed command repeatedly refreshes sample records without duplicates."""
        call_command("seed_data", reports=2, verbosity=0)
        self.assertEqual(Device.objects.count(), 6)
        self.assertEqual(StatusReport.objects.count(), 12)

        call_command("seed_data", reports=3, verbosity=0)
        self.assertEqual(Device.objects.count(), 6)
        self.assertEqual(StatusReport.objects.count(), 18)
