'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Terminal, Image as ImageIcon, Send, X } from 'lucide-react'

interface PostFormProps {
  onPostCreated: () => void
}

interface Command {
  type: 'input' | 'output'
  content: string
  timestamp: Date
}

export function PostForm({ onPostCreated }: PostFormProps) {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCommand, setCurrentCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<Command[]>([])
  const [currentStep, setCurrentStep] = useState<'name' | 'title' | 'content' | 'image' | 'image-upload' | 'confirm'>('name')
  const [isActive, setIsActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isActive])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [commandHistory])

  const addCommand = (type: 'input' | 'output', content: string) => {
    setCommandHistory(prev => [...prev, { type, content, timestamp: new Date() }])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const command = currentCommand.trim()
      
      if (command === 'exit' || command === 'quit') {
        setIsActive(false)
        setCurrentCommand('')
        return
      }

      if (command === 'clear') {
        setCommandHistory([])
        setCurrentCommand('')
        return
      }

      if (command === 'help') {
        addCommand('output', 'Available commands:')
        addCommand('output', '  help - Show this help message')
        addCommand('output', '  clear - Clear terminal')
        addCommand('output', '  exit/quit - Exit post creation')
        addCommand('output', '  skip - Skip current step')
        addCommand('output', '  back - Go back to previous step')
        setCurrentCommand('')
        return
      }

      if (command === 'skip') {
        handleStepSkip()
        return
      }

      if (command === 'back') {
        handleStepBack()
        return
      }

      handleCommandInput(command)
    }
  }

  const handleCommandInput = (command: string) => {
    addCommand('input', command)

    switch (currentStep) {
      case 'name':
        setName(command)
        addCommand('output', `Name set: ${command}`)
        setCurrentStep('title')
        addCommand('output', 'Enter post title:')
        break
      
      case 'title':
        if (!command) {
          addCommand('output', 'Title cannot be empty. Please enter a title:')
          setCurrentCommand('')
          return
        }
        setTitle(command)
        addCommand('output', `Title set: ${command}`)
        setCurrentStep('content')
        addCommand('output', 'Enter post content (type "done" when finished):')
        break
      
      case 'content':
        if (command === 'done') {
          if (!content.trim()) {
            addCommand('output', 'Content cannot be empty. Please enter some content:')
            setCurrentCommand('')
            return
          }
          setCurrentStep('image')
          addCommand('output', 'Content saved!')
          addCommand('output', 'Do you want to attach an image? (y/n):')
        } else {
          setContent(prev => prev ? `${prev}\n${command}` : command)
          addCommand('output', 'Content added. Type "done" when finished or continue adding content:')
        }
        break
      
      case 'image':
        if (command.toLowerCase() === 'y' || command.toLowerCase() === 'yes') {
          addCommand('output', 'Image upload initiated...')
          addCommand('output', 'Click the "Choose Image" button below to select an image:')
          setCurrentStep('image-upload')
        } else if (command.toLowerCase() === 'n' || command.toLowerCase() === 'no') {
          setCurrentStep('confirm')
          showConfirmation()
        } else {
          addCommand('output', 'Please answer with y/n:')
        }
        break
      
      case 'image-upload':
        if (command.toLowerCase() === 'skip' || command.toLowerCase() === 'done') {
          setCurrentStep('confirm')
          showConfirmation()
        } else {
          addCommand('output', 'Type "skip" to continue without image or "done" after uploading:')
        }
        break
      
      case 'confirm':
        if (command.toLowerCase() === 'y' || command.toLowerCase() === 'yes') {
          handleSubmit()
        } else if (command.toLowerCase() === 'n' || command.toLowerCase() === 'no') {
          addCommand('output', 'Post creation cancelled.')
          resetForm()
        } else {
          addCommand('output', 'Please answer with y/n:')
        }
        break
    }

    setCurrentCommand('')
  }

  const handleStepSkip = () => {
    switch (currentStep) {
      case 'name':
        addCommand('output', 'Name skipped (will be anonymous)')
        setCurrentStep('title')
        addCommand('output', 'Enter post title:')
        break
      case 'image':
        addCommand('output', 'Image skipped')
        setCurrentStep('confirm')
        showConfirmation()
        break
      default:
        addCommand('output', 'Cannot skip this step')
    }
    setCurrentCommand('')
  }

  const handleStepBack = () => {
    switch (currentStep) {
      case 'title':
        setCurrentStep('name')
        addCommand('output', 'Back to name entry. Enter your name (or type "skip"):')
        break
      case 'content':
        setCurrentStep('title')
        addCommand('output', 'Back to title entry. Enter post title:')
        break
      case 'image':
        setCurrentStep('content')
        addCommand('output', 'Back to content entry. Continue adding content or type "done":')
        break
      case 'image-upload':
        setCurrentStep('image')
        addCommand('output', 'Back to image selection. Do you want to attach an image? (y/n):')
        break
      case 'confirm':
        setCurrentStep('image')
        addCommand('output', 'Back to image selection. Do you want to attach an image? (y/n):')
        break
      default:
        addCommand('output', 'Cannot go back from this step')
    }
    setCurrentCommand('')
  }

  const showConfirmation = () => {
    addCommand('output', '=== POST PREVIEW ===')
    addCommand('output', `Name: ${name || 'Anonymous'}`)
    addCommand('output', `Title: ${title}`)
    addCommand('output', `Content: ${content}`)
    if (image) {
      addCommand('output', `Image: ${image.name} (${(image.size / 1024).toFixed(1)} KB)`)
    } else {
      addCommand('output', 'Image: None')
    }
    addCommand('output', '==================')
    addCommand('output', 'Create this post? (y/n):')
  }

  const resetForm = () => {
    setName('')
    setTitle('')
    setContent('')
    setImage(null)
    setImagePreview(null)
    setCurrentStep('name')
    setCommandHistory([])
    setIsActive(false)
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `posts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      addCommand('output', `Image selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    addCommand('output', 'Image removed. Type "done" to continue or "skip" to proceed without image.')
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      addCommand('output', 'Error: Title and content are required!')
      return
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      addCommand('output', 'Error: Supabase is not configured!')
      addCommand('output', 'Please set up your environment variables first.')
      return
    }

    setIsSubmitting(true)
    addCommand('output', 'Creating post...')

    try {
      let imageUrl = null
      if (image) {
        imageUrl = await uploadImage(image)
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          name: name.trim() || null,
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl,
        })

      if (error) {
        console.error('Error creating post:', error)
        if (error.message && error.message.includes('Supabase not configured')) {
          addCommand('output', 'Error: Supabase is not configured. Please set up your environment variables.')
        } else {
          addCommand('output', 'Error: Failed to create post. Please try again.')
        }
      } else {
        addCommand('output', 'Post created successfully!')
        onPostCreated()
        resetForm()
      }
    } catch (error) {
      console.error('Error:', error)
      addCommand('output', 'Error: An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startCLI = () => {
    setIsActive(true)
    setCommandHistory([])
    setCurrentStep('name')
    addCommand('output', '=== POST CREATION CLI ===')
    addCommand('output', 'Welcome to the post creation terminal!')
    addCommand('output', 'Type "help" for available commands')
    addCommand('output', 'Enter your name (or type "skip" for anonymous):')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999]">
      {/* Always visible footer header */}
      <div className="border border-green-400/20 bg-black/90 backdrop-blur-sm">
        <div className="border-b border-green-400/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-bold">CREATE_NEW_POST.exe</h2>
            </div>
            <div className="flex items-center space-x-2">
              {isActive && (
                <button
                  onClick={() => setIsActive(false)}
                  className="px-3 py-1 text-xs bg-red-400 text-black font-bold hover:bg-red-300 transition-colors"
                >
                  CLOSE
                </button>
              )}
              {!isActive && (
                <button
                  onClick={startCLI}
                  className="px-4 py-2 bg-green-400 text-black font-bold hover:bg-green-300 transition-colors flex items-center space-x-2"
                >
                  <Terminal className="w-4 h-4" />
                  <span>START_CLI</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* CLI content that slides up */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isActive ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          {isActive && (
            <div className="p-4 h-[calc(100vh-80px)] flex flex-col">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-400/70 ml-4">post-creator@life-as-sde:~$</span>
              </div>
              
              <div 
                ref={terminalRef}
                className="flex-1 overflow-y-auto bg-black/80 p-4 font-mono text-sm border border-green-400/20 mb-4"
              >
                {commandHistory.map((cmd, index) => (
                  <div key={index} className="mb-1">
                    {cmd.type === 'input' ? (
                      <div className="text-green-400">
                        <span className="text-green-400/70">$ </span>
                        {cmd.content}
                      </div>
                    ) : (
                      <div className="text-green-400/80">
                        {cmd.content}
                      </div>
                    )}
                  </div>
                ))}
                
                {isSubmitting && (
                  <div className="text-green-400/80">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                    Processing...
                  </div>
                )}
                
            <div className="flex items-center">
              <span className="text-green-400/70">$ </span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-transparent text-green-400 outline-none flex-1 ml-1"
                placeholder="Enter command..."
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {/* Image Upload Interface - Only show during image-upload step */}
          {currentStep === 'image-upload' && (
            <div className="mt-4 p-3 border border-green-400/30 bg-black/60">
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer border border-green-400/50 hover:border-green-400 px-3 py-2 transition-colors flex items-center space-x-2 text-sm">
                  <ImageIcon className="w-4 h-4" />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                
                {imagePreview && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-12 h-12 object-cover border border-green-400/50"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-green-400/70">
                <p>Select an image file, then type "done" to continue or "skip" to proceed without image.</p>
              </div>
            </div>
          )}
          
          <div className="text-xs text-green-400/70">
            <p>Available commands: help, clear, skip, back, exit</p>
            <p>Current step: {currentStep.toUpperCase()}</p>
          </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}