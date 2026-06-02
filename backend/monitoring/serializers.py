from rest_framework import serializers
from .models import Device, StatusReport

class StatusReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReport
        fields = ['id', 'timestamp', 'status', 'message']
        read_only_fields = ['id', 'timestamp']


class DeviceSerializer(serializers.ModelSerializer):
    is_stale = serializers.BooleanField(read_only=True)

    class Meta:
        model = Device
        fields = [
            'id', 
            'name', 
            'device_type', 
            'ip_address', 
            'location', 
            'registered_at', 
            'current_status', 
            'last_reported_at', 
            'is_stale'
        ]
        read_only_fields = ['id', 'registered_at', 'current_status', 'last_reported_at']