from django.db import models
from django.utils import timezone
from datetime import timedelta

class Device(models.Model):
    # specific device types outlined in the brief
    class DeviceType(models.TextChoices):
        CPE = 'CPE', 'Customer Premises Equipment'
        ROUTER = 'ROUTER', 'Router'
        SWITCH = 'SWITCH', 'Switch'
        ACCESS_POINT = 'AP', 'Access Point'
        FIREWALL = 'FIREWALL', 'Firewall'
        ONT = 'ONT', 'Optical Network Terminal'

    # Enforcing the strict status choices 
    class StatusChoice(models.TextChoices):
        ONLINE = 'ONLINE', 'Online'
        OFFLINE = 'OFFLINE', 'Offline'
        DEGRADED = 'DEGRADED', 'Degraded'

    # Core Asset Information 
    name = models.CharField(max_length=255, help_text="User-defined device asset name") # [cite: 13]
    device_type = models.CharField(max_length=20, choices=DeviceType.choices) # [cite: 14]
    ip_address = models.GenericIPAddressField(help_text="Hostname or IPv4/IPv6 Address") # [cite: 15]
    location = models.CharField(max_length=255, help_text="Physical location or site placement") # [cite: 16]
    registered_at = models.DateTimeField(auto_now_add=True) # [cite: 17]
    
    # Read-Optimized State Caching
    current_status = models.CharField(
        max_length=20, 
        choices=StatusChoice.choices, 
        default=StatusChoice.OFFLINE
    )
    last_reported_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-last_reported_at', 'name']
        indexes = [
            models.Index(fields=['current_status']),
            models.Index(fields=['last_reported_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.ip_address})"

    @property
    def is_stale(self) -> bool:
        """
        A device is stale if it has not submitted a report within the last 15 minutes.
        Computed dynamically to guarantee real-time evaluation without race conditions.
        """
        if not self.last_reported_at:
            return True
        return timezone.now() - self.last_reported_at > timedelta(minutes=15) # 


class StatusReport(models.Model):
    # Need to Append-only ledger linking back to the target asset
    device = models.ForeignKey(
        Device, 
        on_delete=models.CASCADE, 
        related_name='status_reports'
    )
    timestamp = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=Device.StatusChoice.choices) 
    message = models.TextField(blank=True, null=True, help_text="Optional diagnostics text") 

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['device', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.device.name} -> {self.status} at {self.timestamp}"