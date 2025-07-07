from django.contrib import admin
from .models import Club, ClubMembership, ClubPost, ClubEvent, ClubChatMessage, ClubJoinRequest

@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'updated_at')
    search_fields = ('name', 'description', 'tags')

@admin.register(ClubMembership)
class ClubMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'club', 'role', 'joined_at')
    list_filter = ('role', 'club')
    search_fields = ('user__email', 'club__name')

@admin.register(ClubPost)
class ClubPostAdmin(admin.ModelAdmin):
    list_display = ('club', 'author', 'created_at', 'is_public')
    list_filter = ('club', 'is_public')
    search_fields = ('content',)

@admin.register(ClubEvent)
class ClubEventAdmin(admin.ModelAdmin):
    list_display = ('club', 'title', 'start_time', 'end_time')
    list_filter = ('club',)
    search_fields = ('title', 'description')

@admin.register(ClubChatMessage)
class ClubChatMessageAdmin(admin.ModelAdmin):
    list_display = ('club', 'sender', 'created_at', 'pinned')
    list_filter = ('club', 'pinned')
    search_fields = ('content',)

@admin.register(ClubJoinRequest)
class ClubJoinRequestAdmin(admin.ModelAdmin):
    list_display = ('club', 'user', 'status', 'created_at', 'reviewed_at', 'reviewed_by')
    list_filter = ('club', 'status')
    search_fields = ('user__email', 'club__name', 'message') 