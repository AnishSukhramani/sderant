// Authentication utilities with SHA-256 hashing
import { supabase } from './supabase'

export interface User {
  id: string
  name: string
  username_hash: string
  created_at: string
}

// SHA-256 hash function
export async function sha256Hash(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Register a new user
export async function registerUser(name: string, username: string, password: string): Promise<{ success: true; user: User } | { success: false; error: string }> {
  try {
    // Hash the username and password
    const usernameHash = await sha256Hash(username)
    const passwordHash = await sha256Hash(password)

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username_hash', usernameHash)
      .single()

    if (existingUser) {
      return { success: false, error: 'Username already exists' }
    }

    // Insert new user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('users')
      .insert([{
        name,
        username_hash: usernameHash,
        password_hash: passwordHash,
      }])
      .select()
      .single()

    if (error) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    }

    // Store user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify({
        id: data.id,
        name: data.name,
        username_hash: data.username_hash,
        created_at: data.created_at
      }))
    }

    return { 
      success: true, 
      user: {
        id: data.id,
        name: data.name,
        username_hash: data.username_hash,
        created_at: data.created_at
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'An error occurred during registration' }
  }
}

// Login user
export async function loginUser(username: string, password: string): Promise<{ success: true; user: User } | { success: false; error: string }> {
  try {
    // Hash the username and password
    const usernameHash = await sha256Hash(username)
    const passwordHash = await sha256Hash(password)

    // Check if user exists with matching credentials
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username_hash, created_at')
      .eq('username_hash', usernameHash)
      .eq('password_hash', passwordHash)
      .single()

    if (error || !data) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Store user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(data))
    }

    return { success: true, user: data }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'An error occurred during login' }
  }
}

// Logout user
export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser')
  }
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

