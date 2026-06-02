from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Device, StatusReport
from .serializers import DeviceSerializer, StatusReportSerializer

class DeviceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing network infrastructure assets.
    Provides standard endpoints alongside custom telemetry tracking.
    """
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer

    @action(detail=True, methods=['post'], url_path='report')
    def report(self, request, pk=None):
        """
        Receives telemetry from a device, logs history, and updates active device cache state.
        POST /api/devices/{id}/report/
        """
        device = self.get_object()
        serializer = StatusReportSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                # Persist the historical status entry
                report = serializer.save(device=device)
                
                # Update cached metrics on the device record for rapid dashboard reads
                device.current_status = report.status
                device.last_reported_at = report.timestamp
                device.save()
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        """
        Returns the 20 most recent operational reports for a given network asset.
        GET /api/devices/{id}/history/
        """
        device = self.get_object()
        # Enforce the strict upper limit of 20 logs as requested in the brief
        recent_reports = device.status_reports.all()[:20] 
        serializer = StatusReportSerializer(recent_reports, many=True)
        return Response(serializer.data)