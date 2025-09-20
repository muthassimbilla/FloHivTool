"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden p-6 pr-8 transition-all duration-500",
    "backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-slate-700/30",
    "shadow-2xl shadow-black/10 dark:shadow-black/30",
    "rounded-2xl",
    // Swipe animations
    "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
    // State animations with liquid effects
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out",
    "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=closed]:scale-95",
    "data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=open]:scale-100",
    // Glass shine effect
    "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent before:opacity-60",
    // Liquid border animation
    "after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
    "after:translate-x-[-100%] after:group-hover:translate-x-[100%] after:transition-transform after:duration-1000",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-br from-white/80 via-slate-50/60 to-white/40",
          "dark:from-slate-800/80 dark:via-slate-900/60 dark:to-slate-800/40",
          "text-slate-800 dark:text-slate-100",
          "border-slate-200/40 dark:border-slate-600/40",
          "shadow-slate-500/20 dark:shadow-black/40"
        ],
        destructive: [
          "bg-gradient-to-br from-red-500/20 via-red-600/10 to-red-500/20",
          "dark:from-red-900/40 dark:via-red-800/20 dark:to-red-900/40",
          "border-red-500/30 dark:border-red-400/30",
          "text-red-900 dark:text-red-100",
          "shadow-red-500/30 dark:shadow-red-900/50",
          "before:from-red-200/30 before:via-transparent before:to-transparent"
        ],
        success: [
          "bg-gradient-to-br from-emerald-500/20 via-green-600/10 to-emerald-500/20",
          "dark:from-emerald-900/40 dark:via-green-800/20 dark:to-emerald-900/40",
          "border-emerald-500/30 dark:border-emerald-400/30",
          "text-emerald-900 dark:text-emerald-100",
          "shadow-emerald-500/30 dark:shadow-emerald-900/50",
          "before:from-emerald-200/30 before:via-transparent before:to-transparent"
        ],
        warning: [
          "bg-gradient-to-br from-amber-500/20 via-yellow-600/10 to-amber-500/20",
          "dark:from-amber-900/40 dark:via-yellow-800/20 dark:to-amber-900/40",
          "border-amber-500/30 dark:border-amber-400/30",
          "text-amber-900 dark:text-amber-100",
          "shadow-amber-500/30 dark:shadow-amber-900/50",
          "before:from-amber-200/30 before:via-transparent before:to-transparent"
        ]
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, children, ...props }, ref) => {
  return (
    <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props}>
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-2 left-4 w-1 h-1 bg-current opacity-20 rounded-full animate-pulse"></div>
        <div className="absolute top-4 right-8 w-0.5 h-0.5 bg-current opacity-30 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-3 left-8 w-1.5 h-1.5 bg-current opacity-15 rounded-full animate-pulse delay-700"></div>
      </div>
      
      {/* Ripple effect on appear */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-radial from-white/20 to-transparent opacity-0 group-data-[state=open]:animate-ping group-data-[state=open]:opacity-100"></div>
      
      {/* Content */}
      <div className="relative z-10 flex w-full items-center justify-between space-x-4">
        {children}
      </div>
      
      {/* Bottom highlight */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-current/20 to-transparent"></div>
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      [
        "inline-flex h-8 shrink-0 items-center justify-center px-3 text-sm font-medium transition-all duration-300",
        "rounded-lg backdrop-blur-sm",
        "bg-white/20 hover:bg-white/40 dark:bg-slate-700/30 dark:hover:bg-slate-600/50",
        "border border-white/30 hover:border-white/50 dark:border-slate-600/40 dark:hover:border-slate-500/60",
        "text-current hover:text-current/90",
        "shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10",
        "focus:outline-none focus:ring-2 focus:ring-current/30 focus:ring-offset-1 focus:ring-offset-transparent",
        "disabled:pointer-events-none disabled:opacity-50",
        "relative overflow-hidden",
        // Glass shine effect
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
        // Destructive variant styles
        "group-[.destructive]:border-red-400/40 group-[.destructive]:hover:border-red-300/60",
        "group-[.destructive]:hover:bg-red-500/20 group-[.destructive]:text-red-100",
        "group-[.destructive]:focus:ring-red-400/40"
      ],
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      [
        "absolute right-2 top-2 rounded-lg p-1.5 transition-all duration-300",
        "text-current/60 hover:text-current/90",
        "opacity-0 group-hover:opacity-100 focus:opacity-100",
        "hover:bg-white/20 dark:hover:bg-slate-700/30",
        "focus:outline-none focus:ring-2 focus:ring-current/30 focus:ring-offset-1 focus:ring-offset-transparent",
        "backdrop-blur-sm border border-transparent hover:border-white/20 dark:hover:border-slate-600/30",
        "shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10",
        // Rotation effect on hover
        "hover:rotate-90 transform-gpu",
        // Destructive variant
        "group-[.destructive]:text-red-200/70 group-[.destructive]:hover:text-red-100",
        "group-[.destructive]:hover:bg-red-500/20 group-[.destructive]:focus:ring-red-400/40"
      ],
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title 
    ref={ref} 
    className={cn(
      "text-sm font-semibold tracking-tight drop-shadow-sm",
      className
    )} 
    {...props} 
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description 
    ref={ref} 
    className={cn(
      "text-sm opacity-90 drop-shadow-sm leading-relaxed",
      className
    )} 
    {...props} 
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
