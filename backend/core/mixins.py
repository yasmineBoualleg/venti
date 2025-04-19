from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

class LikeableMixin:
    """
    Mixin to add like functionality to a model viewset.
    Requires the model to have a likes ManyToManyField.
    """
    @action(detail=True, methods=['post'])
    def like(self, request, *args, **kwargs):
        obj = self.get_object()
        user = request.user
        
        if obj.likes.filter(id=user.id).exists():
            obj.likes.remove(user)
            return Response({'status': 'unliked'})
        else:
            obj.likes.add(user)
            return Response({'status': 'liked'})

class UserStampedMixin:
    """
    Mixin to automatically set created_by and updated_by fields.
    """
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

class SoftDeleteMixin:
    """
    Mixin to add soft delete functionality.
    Requires the model to have an is_active BooleanField.
    """
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            return queryset.filter(is_active=True)
        return queryset 