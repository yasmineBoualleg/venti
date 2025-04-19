from django.contrib import admin
from .models import Club, ClubRole, ClubMember, Interest, Post

@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name', 'description')

@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ('admins', 'interests')

@admin.register(ClubRole)
class ClubRoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'club', 'created_at')
    list_filter = ('club',)
    search_fields = ('name', 'description', 'club__name')

@admin.register(ClubMember)
class ClubMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'club', 'role', 'joined_at', 'is_active')
    list_filter = ('is_active', 'joined_at', 'club')
    search_fields = ('user__username', 'club__name', 'role__name')
    raw_id_fields = ('user', 'club', 'role')

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'club', 'author', 'created_at')
    list_filter = ('club', 'created_at')
    search_fields = ('title', 'content', 'author__username', 'club__name')
    raw_id_fields = ('author', 'club', 'likes') 