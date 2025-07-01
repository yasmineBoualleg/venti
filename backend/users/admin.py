from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import Profile, CollabRequest, PastCollaboration

User = get_user_model()

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Custom admin for User model."""
    list_display = ('email', 'username', 'first_name', 'last_name', 'place', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username', 'first_name', 'last_name', 'place', 'firebase_uid')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Admin for Profile model."""
    list_display = ('user', 'xp', 'skills_count', 'interests_count', 'hobbies_count', 'badges_count', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__email', 'user__username', 'bio')
    readonly_fields = ('xp', 'badges', 'created_at', 'updated_at')
    
    def skills_count(self, obj):
        return len(obj.skills)
    skills_count.short_description = 'Skills'
    
    def interests_count(self, obj):
        return len(obj.interests)
    interests_count.short_description = 'Interests'
    
    def hobbies_count(self, obj):
        return len(obj.hobbies)
    hobbies_count.short_description = 'Hobbies'
    
    def badges_count(self, obj):
        return len(obj.badges)
    badges_count.short_description = 'Badges'

@admin.register(CollabRequest)
class CollabRequestAdmin(admin.ModelAdmin):
    """Admin for CollabRequest model."""
    list_display = ('from_user', 'to_user', 'skill_focus', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'skill_focus')
    search_fields = ('from_user__email', 'to_user__email', 'skill_focus', 'message')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'

@admin.register(PastCollaboration)
class PastCollaborationAdmin(admin.ModelAdmin):
    """Admin for PastCollaboration model."""
    list_display = ('user_a', 'user_b', 'skill_used', 'collab_type', 'timestamp')
    list_filter = ('collab_type', 'skill_used', 'timestamp')
    search_fields = ('user_a__email', 'user_b__email', 'skill_used')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp' 