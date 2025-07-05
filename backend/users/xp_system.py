"""
Centralized XP System for Venti Platform
Contains XP rewards, level calculations, and utility functions
"""

from django.utils import timezone
from .models import Profile, XPLog

# XP Rewards Table - Centralized values
XP_REWARDS = {
    'account_created': 10,         # Account signup
    'profile_completed': 25,       # Complete profile
    'club_joined': 30,             # Join a club
    'event_attended': 40,          # Attend event
    'study_arena_session': 40,     # Study Arena session (participation)
    'study_arena_win': 50,         # Win Study Arena
    'post_created': 15,            # Post content
    'friend_invited': 45,          # Invite a friend
    # Legacy/other keys for compatibility
    'profile_edit': 5,
    'session_activity': 10,  # 30+ min session
    'daily_activity': 15,    # First 30+ min session of day
    'collaboration': 20,     # Accepted collaboration request
    'project_uploaded': 40,
    'comment_posted': 3,
    'skill_added': 5,
    'badge_earned': 10,
    'login_streak_7': 25,
    'login_streak_30': 100,
    'admin_grant': 0,  # For admin/manual grants
}

def add_xp(user, amount, reason, description=''):
    """
    Centralized function to add XP to a user's profile.
    
    Args:
        user: User instance
        amount: XP amount to add
        reason: Reason for XP gain (should match XP_REWARDS keys)
        description: Optional description
    
    Returns:
        dict: Result with success status and level up info
    """
    try:
        profile = user.profile
        result = profile.add_xp(amount, reason, description)
        return result
    except Exception as e:
        print(f"Error adding XP to user {user.email}: {e}")
        return {'success': False, 'level_up': False, 'error': str(e)}

def add_xp_by_reason(user, reason, description=''):
    """
    Add XP using predefined rewards from XP_REWARDS table.
    
    Args:
        user: User instance
        reason: Reason key from XP_REWARDS
        description: Optional description
    
    Returns:
        dict: Result with success status and level up info
    """
    if reason not in XP_REWARDS:
        return {'success': False, 'level_up': False, 'error': f'Unknown reason: {reason}'}
    
    amount = XP_REWARDS[reason]
    return add_xp(user, amount, reason, description)

def calculate_level(xp):
    """
    Calculate level based on XP using exponential growth formula.
    
    Args:
        xp: Total XP
    
    Returns:
        int: Current level
    """
    level = 1
    remaining_xp = xp
    
    while remaining_xp >= level * 100:
        remaining_xp -= level * 100
        level += 1
    
    return level

def get_xp_for_next_level(current_level):
    """
    Get XP needed for next level.
    
    Args:
        current_level: Current user level
    
    Returns:
        int: XP needed for next level
    """
    return current_level * 100

def get_total_xp_for_level(target_level):
    """
    Get total XP needed to reach a specific level.
    
    Args:
        target_level: Target level to reach
    
    Returns:
        int: Total XP needed
    """
    total_xp = 0
    for level in range(1, target_level):
        total_xp += level * 100
    return total_xp

def get_xp_progress_percent(total_xp, current_level):
    """
    Get XP progress percentage for current level.
    
    Args:
        total_xp: Total user XP
        current_level: Current user level
    
    Returns:
        float: Progress percentage (0-100)
    """
    xp_in_current_level = total_xp
    for level in range(1, current_level):
        xp_in_current_level -= level * 100
    
    xp_needed_for_level = current_level * 100
    return min(100, (xp_in_current_level / xp_needed_for_level) * 100)

def get_user_xp_stats(user):
    """
    Get comprehensive XP statistics for a user.
    
    Args:
        user: User instance
    
    Returns:
        dict: XP statistics
    """
    try:
        profile = user.profile
        current_level = profile.level
        next_level_xp = get_xp_for_next_level(current_level)
        progress_percent = get_xp_progress_percent(profile.xp, current_level)
        
        return {
            'current_xp': profile.xp,
            'current_level': current_level,
            'xp_for_next_level': next_level_xp,
            'xp_progress_percent': progress_percent,
            'daily_xp_earned': profile.daily_xp_earned,
            'daily_xp_remaining': profile.get_daily_xp_remaining(),
            'total_xp_logs': profile.xp_logs.count()
        }
    except Exception as e:
        print(f"Error getting XP stats for user {user.email}: {e}")
        return None

def get_top_xp_users(limit=10):
    """
    Get top XP users for leaderboard.
    
    Args:
        limit: Number of users to return
    
    Returns:
        QuerySet: Top XP users
    """
    return Profile.objects.order_by('-xp', '-level')[:limit]

def get_user_xp_history(user, limit=20):
    """
    Get user's XP gain history.
    
    Args:
        user: User instance
        limit: Number of logs to return
    
    Returns:
        QuerySet: XP logs
    """
    try:
        return user.profile.xp_logs.all()[:limit]
    except:
        return []

def award_xp_for_profile_completion(user):
    """
    Award XP for completing profile (has bio, skills, interests, hobbies).
    
    Args:
        user: User instance
    
    Returns:
        dict: Result with success status
    """
    try:
        profile = user.profile
        
        # Check if profile is complete
        is_complete = (
            profile.bio and 
            len(profile.skills) > 0 and 
            len(profile.interests) > 0 and 
            len(profile.hobbies) > 0
        )
        
        if is_complete:
            # Check if already awarded
            existing_award = profile.xp_logs.filter(reason='profile_completed').exists()
            if not existing_award:
                return add_xp_by_reason(user, 'profile_completed', 'Profile completion bonus')
        
        return {'success': False, 'level_up': False, 'message': 'Profile not complete or already awarded'}
    except Exception as e:
        return {'success': False, 'level_up': False, 'error': str(e)}

def award_xp_for_login_streak(user, streak_days):
    """
    Award XP for login streaks.
    
    Args:
        user: User instance
        streak_days: Number of consecutive login days
    
    Returns:
        dict: Result with success status
    """
    try:
        if streak_days >= 30:
            return add_xp_by_reason(user, 'login_streak_30', f'{streak_days} day login streak')
        elif streak_days >= 7:
            return add_xp_by_reason(user, 'login_streak_7', f'{streak_days} day login streak')
        
        return {'success': False, 'level_up': False, 'message': 'Streak not long enough'}
    except Exception as e:
        return {'success': False, 'level_up': False, 'error': str(e)} 