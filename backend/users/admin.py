from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import Profile, CollabRequest, PastCollaboration, XPLog, UserActivity

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
    list_display = ('user', 'xp', 'daily_xp_earned', 'last_daily_reset', 'created_at')
    list_filter = ('created_at', 'last_daily_reset')
    search_fields = ('user__email', 'user__username', 'bio')
    readonly_fields = ('created_at', 'updated_at', 'xp', 'daily_xp_earned', 'last_daily_reset')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User Info', {'fields': ('user',)}),
        ('XP & Activity', {'fields': ('xp', 'daily_xp_earned', 'last_daily_reset', 'last_activity')}),
        ('Profile Content', {'fields': ('bio', 'skills', 'interests', 'hobbies', 'profile_image', 'badges')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

@admin.register(XPLog)
class XPLogAdmin(admin.ModelAdmin):
    """Admin for XPLog model."""
    list_display = ('profile', 'amount', 'reason', 'created_at')
    list_filter = ('reason', 'created_at')
    search_fields = ('profile__user__email', 'description')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    """Admin for UserActivity model."""
    list_display = ('user', 'session_start', 'session_end', 'duration_minutes', 'is_active')
    list_filter = ('is_active', 'session_start')
    search_fields = ('user__email',)
    readonly_fields = ('session_start', 'session_end', 'duration_minutes')
    date_hierarchy = 'session_start'
    ordering = ('-session_start',)

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
    list_filter = ('collab_type', 'timestamp', 'skill_used')
    search_fields = ('user_a__email', 'user_b__email', 'skill_used')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp' 