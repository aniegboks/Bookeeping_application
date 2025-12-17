"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";

// Extend the Window interface to include Freshworks properties
declare global {
  interface Window {
    FreshworksWidget?: unknown;
    fwcrm?: unknown;
    fcWidgetMessengerConfig?: {
      config: {
        headerProperty?: {
          direction: string;
          backgroundColor?: string;
        };
        cssNames?: {
          widget: string;
        };
      };
    };
  }
}

export default function ChatLoader() {
  const { user } = useUser();
  const isLoadedRef = useRef(false);

  useEffect(() => {
    // Cleanup function
    const cleanupFreshworks = () => {
      console.log("🧹 Cleaning up Freshworks widget");
      
      // Remove script
      const scriptElement = document.getElementById("fw-chat-widget");
      if (scriptElement) {
        scriptElement.remove();
      }
      
      // Remove custom styles
      const styleElement = document.getElementById("fw-custom-styles");
      if (styleElement) {
        styleElement.remove();
      }
      
      // Remove all Freshworks-related elements
      const selectors = [
        '#fw-chat-frame',
        '[id^="fw-"]',
        '[class*="freshworks"]',
        '[class*="fw-chat"]',
        'iframe[src*="freshworks"]',
        'iframe[src*="fw-cdn"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });
      
      // Clear Freshworks global variables
      if (typeof window !== 'undefined') {
        window.FreshworksWidget = undefined;
        window.fwcrm = undefined;
        window.fcWidgetMessengerConfig = undefined;
      }
      
      isLoadedRef.current = false;
    };

    if (!user) {
      // User logged out - clean up
      cleanupFreshworks();
      return;
    }

    // User is logged in - load widget if not already loaded
    if (isLoadedRef.current || document.getElementById("fw-chat-widget")) {
      return;
    }

    console.log("📞 Loading Freshworks widget");

    // Configure Freshworks widget BEFORE loading the script
    window.fcWidgetMessengerConfig = {
      config: {
        headerProperty: {
          direction: 'ltr',
          backgroundColor: '#3D4C63' // Custom dark blue-gray color
        },
        cssNames: {
          widget: "custom_fc_frame"
        }
      }
    };

    // Add custom CSS for positioning and sizing
    const style = document.createElement("style");
    style.id = "fw-custom-styles";
    style.textContent = `
      /* Position and size Freshworks chat widget */
      .custom_fc_frame {
        right: auto !important;
        left: 20px !important;
        bottom: 100px !important;
        transform: scale(0.85) !important;
        transform-origin: bottom left !important;
      }
      
      /* Additional targeting for any other elements */
      #fw-chat-frame,
      [id^="fw-"][id$="-frame"],
      iframe[src*="freshworks"],
      iframe[src*="fw-cdn"] {
        right: auto !important;
        left: 20px !important;
        bottom: 100px !important;
        transform: scale(0.85) !important;
        transform-origin: bottom left !important;
      }
      
      /* Scale the launcher button as well */
      div[id^="fc_frame"],
      div[class*="fc-widget"] {
        transform: scale(0.85) !important;
        transform-origin: bottom left !important;
      }
    `;
    document.head.appendChild(style);

    // Load the script after configuration
    const script = document.createElement("script");
    script.id = "fw-chat-widget";
    script.src = "//uae.fw-cdn.com/40344074/216337.js";
    script.async = true;
    script.setAttribute("data-chat", "true");

    document.body.appendChild(script);
    isLoadedRef.current = true;

    // Cleanup on unmount
    return cleanupFreshworks;
  }, [user]);

  return null;
}