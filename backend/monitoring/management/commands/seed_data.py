from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from monitoring.models import Device, StatusReport


class Command(BaseCommand):
    help = "Seed the database with sample network devices and telemetry reports."

    devices = [
        {
            "name": "Kampala HQ Core Router",
            "device_type": Device.DeviceType.ROUTER,
            "ip_address": "10.10.0.1",
            "location": "Kampala HQ Data Center",
            "status": Device.StatusChoice.ONLINE,
            "minutes_ago": 3,
            "message": "Primary uplink stable. BGP sessions established.",
        },
        {
            "name": "Entebbe Branch Edge Switch",
            "device_type": Device.DeviceType.SWITCH,
            "ip_address": "10.20.0.5",
            "location": "Entebbe Branch MDF",
            "status": Device.StatusChoice.DEGRADED,
            "minutes_ago": 8,
            "message": "Packet loss detected on uplink port ge-0/0/1.",
        },
        {
            "name": "Jinja Warehouse Access Point",
            "device_type": Device.DeviceType.ACCESS_POINT,
            "ip_address": "10.30.4.12",
            "location": "Jinja Warehouse Floor A",
            "status": Device.StatusChoice.ONLINE,
            "minutes_ago": 12,
            "message": "Client load normal. Channel utilization within limits.",
        },
        {
            "name": "Mbarara CPE Gateway",
            "device_type": Device.DeviceType.CPE,
            "ip_address": "10.40.1.9",
            "location": "Mbarara Customer Site",
            "status": Device.StatusChoice.OFFLINE,
            "minutes_ago": 42,
            "message": "No heartbeat received from customer gateway.",
        },
        {
            "name": "Gulu Perimeter Firewall",
            "device_type": Device.DeviceType.FIREWALL,
            "ip_address": "10.50.0.2",
            "location": "Gulu Regional Office",
            "status": Device.StatusChoice.ONLINE,
            "minutes_ago": 2,
            "message": "Policy sync completed. Threat feed current.",
        },
        {
            "name": "Mukono ONT Node",
            "device_type": Device.DeviceType.ONT,
            "ip_address": "10.60.2.15",
            "location": "Mukono Fiber Cabinet 03",
            "status": Device.StatusChoice.DEGRADED,
            "minutes_ago": 18,
            "message": "Optical receive power below preferred threshold.",
        },
    ]

    def add_arguments(self, parser):
        parser.add_argument(
            "--reports",
            type=int,
            default=4,
            help="Number of telemetry reports to create per seeded device.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        report_count = max(1, options["reports"])
        now = timezone.now()
        created_count = 0

        for seed in self.devices:
            latest_timestamp = now - timedelta(minutes=seed["minutes_ago"])
            device, created = Device.objects.update_or_create(
                ip_address=seed["ip_address"],
                defaults={
                    "name": seed["name"],
                    "device_type": seed["device_type"],
                    "location": seed["location"],
                    "current_status": seed["status"],
                    "last_reported_at": latest_timestamp,
                },
            )
            created_count += int(created)

            device.status_reports.all().delete()
            self._create_reports(device, seed, latest_timestamp, report_count)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(self.devices)} devices "
                f"({created_count} new) with {report_count} reports each."
            )
        )

    def _create_reports(self, device, seed, latest_timestamp, report_count):
        reports = []
        statuses = [
            seed["status"],
            Device.StatusChoice.ONLINE,
            Device.StatusChoice.DEGRADED,
            Device.StatusChoice.OFFLINE,
        ]

        for index in range(report_count):
            status = statuses[index % len(statuses)]
            timestamp = latest_timestamp - timedelta(minutes=index * 7)
            message = seed["message"] if index == 0 else f"Automated sample heartbeat #{index + 1}."
            reports.append(
                StatusReport(
                    device=device,
                    status=status,
                    timestamp=timestamp,
                    message=message,
                )
            )

        StatusReport.objects.bulk_create(reports)
