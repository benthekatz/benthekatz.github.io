"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Minus, Square } from "lucide-react"
import Image from 'next/image'


interface WindowState {
  id: string
  title: string
  content: string
  isOpen: boolean
  isMinimized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
}

interface AppIcon {
  id: string
  title: string
  icon: string
  content: string
}

const apps: AppIcon[] = [
  {
    id: "about",
    title: "About Me",
    icon: "👤",
    content: "about",
  },
  // {
  //   id: "projects",
  //   title: "Projects",
  //   icon: "💼",
  //   content: "projects",
  // },
  {
    id: "skills",
    title: "Skills",
    icon: "🛠️",
    content: "skills",
  },
  {
    id: "contact",
    title: "Contact",
    icon: "📧",
    content: "contact",
  },
  {
    id: "resume",
    title: "Resume",
    icon: "📄",
    content: "resume",
  },
  {
    id: "notepad",
    title: "Notepad",
    icon: "📝",
    content: "notepad",
  },
]

function Window({
  windowState,
  onClose,
  onMinimize,
  onFocus,
  onMove,
  onResize,
}: {
  windowState: WindowState
  onClose: (id: string) => void
  onMinimize: (id: string) => void
  onFocus: (id: string) => void
  onMove: (id: string, position: { x: number; y: number }) => void
  onResize: (id: string, size: { width: number; height: number }) => void
}) {
  const windowRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const isResizing = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".window-controls")) return
    if ((e.target as HTMLElement).closest(".resize-handle")) return

    isDragging.current = true
    dragStart.current = {
      x: e.clientX - windowState.position.x,
      y: e.clientY - windowState.position.y,
    }
    onFocus(windowState.id)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".window-controls")) return
    if ((e.target as HTMLElement).closest(".resize-handle")) return

    const touch = e.touches[0]
    isDragging.current = true
    dragStart.current = {
      x: touch.clientX - windowState.position.x,
      y: touch.clientY - windowState.position.y,
    }
    onFocus(windowState.id)
  }

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    isResizing.current = true

    const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX
    const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY

    resizeStart.current = {
      x: clientX,
      y: clientY,
      width: windowState.size.width,
      height: windowState.size.height,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const maxX = Math.max(0, (typeof window !== "undefined" ? window.innerWidth : 800) - windowState.size.width)
        const maxY = Math.max(
          0,
          (typeof window !== "undefined" ? window.innerHeight : 600) - windowState.size.height - 40,
        )
        const newX = Math.max(0, Math.min(maxX, e.clientX - dragStart.current.x))
        const newY = Math.max(0, Math.min(maxY, e.clientY - dragStart.current.y))
        onMove(windowState.id, { x: newX, y: newY })
      }

      if (isResizing.current) {
        const deltaX = e.clientX - resizeStart.current.x
        const deltaY = e.clientY - resizeStart.current.y
        const newWidth = Math.max(200, resizeStart.current.width + deltaX)
        const newHeight = Math.max(150, resizeStart.current.height + deltaY)
        onResize(windowState.id, { width: newWidth, height: newHeight })
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (isDragging.current) {
        const maxX = Math.max(0, (typeof window !== "undefined" ? window.innerWidth : 800) - windowState.size.width)
        const maxY = Math.max(
          0,
          (typeof window !== "undefined" ? window.innerHeight : 600) - windowState.size.height - 40,
        )
        const newX = Math.max(0, Math.min(maxX, touch.clientX - dragStart.current.x))
        const newY = Math.max(0, Math.min(maxY, touch.clientY - dragStart.current.y))
        onMove(windowState.id, { x: newX, y: newY })
      }

      if (isResizing.current) {
        const deltaX = touch.clientX - resizeStart.current.x
        const deltaY = touch.clientY - resizeStart.current.y
        const newWidth = Math.max(200, resizeStart.current.width + deltaX)
        const newHeight = Math.max(150, resizeStart.current.height + deltaY)
        onResize(windowState.id, { width: newWidth, height: newHeight })
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
      isResizing.current = false
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleMouseUp)
    }
  }, [windowState.id, windowState.size.width, windowState.size.height, onMove, onResize])

  if (!windowState.isOpen || windowState.isMinimized) return null

  const getContent = () => {
    switch (windowState.content) {
      case "about":
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold">About Me</h2>
            <p>Hello! My name is Ben Katz!</p>
            <Image src="/images/portrait.png" alt="self-portrait" width="128" height="128" className="m-auto border border-gray-400"/>
            <p>
              I'm a passionate developer who loves creating innovative web experiences. I specialize in modern
              web technologies and enjoy bringing creative ideas to life. With over five years of experience in full-stack
              development, I am not only adept at building the front-end, but its supporting backend systems as well.
            </p>
            <p>
              When I'm not coding, you can find me designing clothes, playing tennis, building <a href="https://archidekt.com/u/tentaclesjr">
              Magic the Gathering decks</a>, collecting vinyl records, and cooking various Italian dishes.
            </p>
          </div>
        )
      case "projects":
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold">My Projects</h2>
            <div className="space-y-3">
              <div className="border border-gray-400 p-3">
                <h3 className="font-bold">Lorem ipsum</h3>
                <p className="text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt</p>
              </div>
              <div className="border border-gray-400 p-3">
                <h3 className="font-bold">Lorem ipsum</h3>
                <p className="text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt</p>
              </div>
              <div className="border border-gray-400 p-3">
                <h3 className="font-bold">Lorem ipsum</h3>
                <p className="text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
              </div>
            </div>
          </div>
        )
      case "skills":
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold">Technical Skills</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">Frontend</h3>
                <ul className="text-sm space-y-1">
                  <li>• React/Next.js</li>
                  <li>• React Native</li>
                  <li>• Angular</li>
                  <li>• TypeScript</li>
                  <li>• Javascript</li>
                  <li>• Tailwind CSS</li>
                  <li>• 10+ yrs Adobe Suite</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2">Backend</h3>
                <ul className="text-sm space-y-1">
                  <li>• Java</li>
                  <li>• Kotlin</li>
                  <li>• Node.js</li>
                  <li>• Spring Boot</li>
                  <li>• Android</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case "contact":
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold">Get In Touch</h2>
            <div className="space-y-3 text-nowrap">
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>
                  <a href="mailto:benthekatz@gmail.com" target="_blank">
                    benthekatz@gmail.com
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🐙</span>
                <span>
                  <a href="https://github.com/benthekatz/" target="_blank">
                    https://github.com/benthekatz/
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>💼</span>
                <span>
                  <a href="https://www.linkedin.com/in/benthekatz/" target="_blank">
                    https://www.linkedin.com/in/benthekatz/
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>📷</span>
                <span>
                  <a href="https://www.instagram.com/yung_deaf/" target="_blank">
                    @yung_deaf
                  </a>
                </span>
              </div>
            </div>
          </div>
        )
      case "resume":
        return (
          <div className="p-4 space-y-4">
            <div className="space-y-4">
              <span>
              <h3 className="font-bold border border-gray-400">
                📄
                <a href="/files/Resume_Benjamin_Katz.pdf" target="_blank" title="Click to view.">
                  Resume_Benjamin_Katz.pdf
                </a>
              </h3>
              </span>
            </div>
          </div>
        )
      case "notepad":
        return (
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Notepad</h2>
            <textarea
              className="w-full h-32 p-2 border border-gray-400 resize-none font-mono text-sm"
              placeholder="Type your notes here..."
              defaultValue="Welcome to BenOS!&#10;&#10;Feel free to explore the different sections by clicking on the desktop icons.&#10;&#10;This nostalgic interface brings back memories of simpler times in computing."
            />
          </div>
        )
      default:
        return <div className="p-4">Content not found</div>
    }
  }

  return (
    <div
      ref={windowRef}
      className="absolute bg-gray-200 border-2 border-gray-400 shadow-lg select-none"
      style={{
        left: windowState.position.x,
        top: windowState.position.y,
        width: windowState.size.width,
        height: windowState.size.height,
        zIndex: windowState.zIndex,
        borderStyle: "outset",
      }}
      onMouseDown={() => onFocus(windowState.id)}
    >
      {/* Title Bar */}
      <div
        className="bg-gray-300 border-b border-gray-400 px-2 py-1 flex items-center justify-between cursor-move"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ borderStyle: "outset", borderWidth: "1px" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{windowState.title}</span>
        </div>
        <div className="window-controls flex gap-1">
          <button
            className="w-6 h-5 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs hover:bg-gray-300"
            style={{ borderStyle: "outset" }}
            onClick={() => onMinimize(windowState.id)}
          >
            <Minus size={10} />
          </button>
          <button
            className="w-6 h-5 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs hover:bg-gray-300"
            style={{ borderStyle: "outset" }}
          >
            <Square size={8} />
          </button>
          <button
            className="w-6 h-5 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs hover:bg-gray-300"
            style={{ borderStyle: "outset" }}
            onClick={() => onClose(windowState.id)}
          >
            <X size={10} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-auto" style={{ height: "calc(100% - 28px)" }}>
        {getContent()}
      </div>

      {/* Resize Handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
        style={{
          background:
            "linear-gradient(-45deg, transparent 0%, transparent 30%, #666 30%, #666 40%, transparent 40%, transparent 60%, #666 60%, #666 70%, transparent 70%)",
        }}
      />
    </div>
  )
}

function StartMenu({
  apps,
  isOpen,
  onClose,
  onAppClick,
}: {
  apps: AppIcon[]
  isOpen: boolean
  onClose: () => void
  onAppClick: (app: AppIcon) => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="fixed bottom-10 left-0 bg-gray-200 border-2 border-gray-400 shadow-lg z-50 w-48"
      style={{ borderStyle: "outset" }}
    >
      {/* Start Menu Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-2 text-sm font-bold border-b border-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-800 text-xs font-bold">
            :)
          </div>
          BenOS
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {apps.map((app) => (
          <button
            key={app.id}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-600 hover:text-white text-sm"
            onClick={() => {
              onAppClick(app)
              onClose()
            }}
          >
            <span className="text-lg">{app.icon}</span>
            <span>{app.title}</span>
          </button>
        ))}

        {/*/!* Separator *!/*/}
        {/*<div className="border-t border-gray-400 my-1" />*/}

        {/*/!* System Items *!/*/}
        {/*<button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-600 hover:text-white text-sm">*/}
        {/*  <span className="text-lg">⚙️</span>*/}
        {/*  <span>Settings</span>*/}
        {/*</button>*/}
        {/*<button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-600 hover:text-white text-sm">*/}
        {/*  <span className="text-lg">❓</span>*/}
        {/*  <span>Help</span>*/}
        {/*</button>*/}
        {/*<button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-600 hover:text-white text-sm">*/}
        {/*  <span className="text-lg">🔌</span>*/}
        {/*  <span>Shut Down...</span>*/}
        {/*</button>*/}
      </div>
    </div>
  )
}

function DesktopIcon({ app, onOpen }: { app: AppIcon; onOpen: (app: AppIcon) => void }) {
  return (
    <div
      className="flex flex-col items-center p-2 cursor-pointer hover:outline hover:outline-1 hover:outline-white hover:outline-offset-1 rounded select-none w-20"
      onClick={() => onOpen(app)}
    >
      <div className="text-2xl mb-1">{app.icon}</div>
      <div className="text-white text-xs text-center font-bold drop-shadow-lg leading-tight">{app.title}</div>
    </div>
  )
}

function Taskbar({
  windows,
  onWindowClick,
  onStartClick,
}: {
  windows: WindowState[]
  onWindowClick: (id: string) => void
  onStartClick: () => void
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-10 bg-gray-300 border-t-2 border-gray-400 flex items-center px-2 z-50"
      style={{ borderStyle: "outset" }}
    >
      <button
        className="bg-gray-200 border border-gray-400 px-3 py-1 text-sm font-bold hover:bg-gray-300 mr-2"
        style={{ borderStyle: "outset" }}
        onClick={onStartClick}
      >
        Start
      </button>

      <div className="flex gap-1 flex-1">
        {windows
          .filter((w) => w.isOpen)
          .map((window) => (
            <button
              key={window.id}
              className={`bg-gray-200 border border-gray-400 px-2 py-1 text-xs truncate max-w-32 hover:bg-gray-300 ${
                window.isMinimized ? "opacity-75" : ""
              }`}
              style={{ borderStyle: window.isMinimized ? "inset" : "outset" }}
              onClick={() => onWindowClick(window.id)}
            >
              {window.title}
            </button>
          ))}
      </div>

      <div className="text-xs bg-gray-200 border border-gray-400 px-2 py-1" style={{ borderStyle: "inset" }}>
        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  )
}

export default function Component() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [nextZIndex, setNextZIndex] = useState(1)
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)

  const openWindow = (app: AppIcon) => {
    const existingWindow = windows.find((w) => w.id === app.id)

    if (existingWindow) {
      if (existingWindow.isMinimized) {
        setWindows((prev) => prev.map((w) => (w.id === app.id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w)))
        setNextZIndex((prev) => prev + 1)
      } else {
        focusWindow(app.id)
      }
      return
    }

    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 800
    const screenHeight = typeof window !== "undefined" ? window.innerHeight : 600
    const windowWidth = Math.min(400, screenWidth - 40)
    const windowHeight = Math.min(300, screenHeight - 80)

    const newWindow: WindowState = {
      id: app.id,
      title: app.title,
      content: app.content,
      isOpen: true,
      isMinimized: false,
      position: {
        x: Math.max(0, Math.min(screenWidth - windowWidth, Math.random() * (screenWidth - windowWidth))),
        y: Math.max(0, Math.min(screenHeight - windowHeight - 40, Math.random() * (screenHeight - windowHeight - 40))),
      },
      size: { width: windowWidth, height: windowHeight },
      zIndex: nextZIndex,
    }

    setWindows((prev) => [...prev, newWindow])
    setNextZIndex((prev) => prev + 1)
  }

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }

  const minimizeWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)))
  }

  const focusWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex } : w)))
    setNextZIndex((prev) => prev + 1)
  }

  const moveWindow = (id: string, position: { x: number; y: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, position } : w)))
  }

  const resizeWindow = (id: string, size: { width: number; height: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, size } : w)))
  }

  const handleTaskbarWindowClick = (id: string) => {
    const window = windows.find((w) => w.id === id)
    if (window?.isMinimized) {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w)))
      setNextZIndex((prev) => prev + 1)
    } else {
      minimizeWindow(id)
    }
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-teal-600 relative"
      style={{
        backgroundImage: `
             radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)
           `,
        backgroundSize: "20px 20px",
      }}
    >
      {/* Desktop Icons */}
      <div className="p-4 flex flex-col items-start gap-2 h-full overflow-y-auto pb-12">
        {apps.map((app) => (
          <DesktopIcon key={app.id} app={app} onOpen={openWindow} />
        ))}
      </div>

      {/* Windows */}
      {windows.map((windowState) => (
        <Window
          key={windowState.id}
          windowState={windowState}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onFocus={focusWindow}
          onMove={moveWindow}
          onResize={resizeWindow}
        />
      ))}

      {/* Start Menu */}
      <StartMenu
        apps={apps}
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        onAppClick={openWindow}
      />

      {/* Taskbar */}
      <Taskbar
        windows={windows}
        onWindowClick={handleTaskbarWindowClick}
        onStartClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
      />
    </div>
  )
}
