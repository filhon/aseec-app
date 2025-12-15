"use client"

// In a real app, this would check the user's role from the auth context/session.
// For now, we mock it as true to facilitate development.

export function useAdmin() {
    // TODO: Connect to real auth logic
    const isAdmin = true
    
    return {
        isAdmin,
        loading: false
    }
}
