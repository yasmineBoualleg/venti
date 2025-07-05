#!/usr/bin/env python3
"""
Test script to demonstrate the game-like XP curve progression.
Shows how each level requires progressively more XP.
"""

def calculate_level(xp):
    """Calculate level based on XP using exponential growth formula."""
    level = 1
    remaining_xp = xp
    
    while remaining_xp >= level * 100:
        remaining_xp -= level * 100
        level += 1
    
    return level

def get_xp_for_next_level(current_level):
    """Get XP needed for next level."""
    return current_level * 100

def get_total_xp_for_level(target_level):
    """Get total XP needed to reach a specific level."""
    total_xp = 0
    for level in range(1, target_level):
        total_xp += level * 100
    return total_xp

def main():
    print("🎮 Venti XP System - Game-like Curve Demo")
    print("=" * 50)
    print()
    
    print("📊 Level Progression:")
    print("-" * 30)
    
    # Show first 10 levels
    for level in range(1, 11):
        xp_needed = get_xp_for_next_level(level)
        total_xp = get_total_xp_for_level(level + 1)
        print(f"Level {level}: {xp_needed} XP needed (Total: {total_xp} XP)")
    
    print()
    print("🎯 Example XP Values:")
    print("-" * 25)
    
    # Test some XP values
    test_xp_values = [50, 100, 250, 500, 1000, 2000, 5000]
    
    for xp in test_xp_values:
        level = calculate_level(xp)
        next_level_xp = get_xp_for_next_level(level)
        total_for_next = get_total_xp_for_level(level + 1)
        xp_remaining = total_for_next - xp
        
        print(f"{xp} XP → Level {level} (Need {xp_remaining} more for Level {level + 1})")
    
    print()
    print("💡 Key Features:")
    print("-" * 15)
    print("• Level 1: 100 XP needed")
    print("• Level 2: 200 XP needed (300 total)")
    print("• Level 3: 300 XP needed (600 total)")
    print("• Level 4: 400 XP needed (1000 total)")
    print("• Level 5: 500 XP needed (1500 total)")
    print("• Each level requires progressively more XP!")
    print()
    print("🎉 This creates a satisfying progression curve that gets harder as you advance!")

if __name__ == "__main__":
    main() 