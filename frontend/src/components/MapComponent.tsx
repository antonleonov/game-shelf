'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'

interface MapComponentProps {
  userLocation: {
    latitude: number
    longitude: number
    city?: string
    country?: string
  }
  nearbyUsers: Array<{
    user_id: number
    name: string
    email: string
    picture?: string
    latitude: number
    longitude: number
  }>
}

export default function MapComponent({ userLocation, nearbyUsers }: MapComponentProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Dynamically import Leaflet only on client side
    import('leaflet').then((L) => {
      // Import CSS
      require('leaflet/dist/leaflet.css')

      // Fix for default marker icons in Next.js
      delete (L.default.Icon.Default.prototype as any)._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Initialize map
      const map = L.default.map(mapContainerRef.current!).setView(
        [userLocation.latitude, userLocation.longitude],
        13
      )

      // Add OpenStreetMap tile layer
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map

      // Add user location marker (blue)
      const userIcon = L.default.divIcon({
        className: 'custom-marker user-marker',
        html: `<div style="
          width: 30px;
          height: 30px;
          background-color: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      const userMarker = L.default.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
      }).addTo(map)

      const userPopup = L.default.popup().setContent(`
        <div style="text-align: center;">
          <strong>Your Location</strong><br/>
          ${userLocation.city ? `${userLocation.city}, ` : ''}
          ${userLocation.country || ''}
        </div>
      `)
      userMarker.bindPopup(userPopup)
      markersRef.current.push(userMarker)

      // Add nearby users markers (green)
      nearbyUsers.forEach((user) => {
        const userIcon = L.default.divIcon({
          className: 'custom-marker nearby-marker',
          html: `<div style="
            width: 25px;
            height: 25px;
            background-color: #10b981;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [25, 25],
          iconAnchor: [12.5, 12.5],
        })

        const marker = L.default.marker([user.latitude, user.longitude], {
          icon: userIcon,
        }).addTo(map)

        const popup = L.default.popup().setContent(`
          <div style="text-align: center;">
            <strong>${user.name}</strong><br/>
            <span style="font-size: 12px; color: #666;">${user.email}</span>
          </div>
        `)
        marker.bindPopup(popup)
        markersRef.current.push(marker)
      })

      // Fit map to show all markers
      if (markersRef.current.length > 0) {
        const group = new L.default.FeatureGroup(markersRef.current)
        map.fitBounds(group.getBounds().pad(0.1))
      } else {
        // If only user location, center on it
        map.setView([userLocation.latitude, userLocation.longitude], 13)
      }
    })

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers when nearbyUsers changes
  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then((L) => {
      // Clear existing markers except user marker
      markersRef.current.forEach((marker, index) => {
        if (index > 0) marker.remove() // Keep first marker (user location)
      })
      markersRef.current = markersRef.current.slice(0, 1) // Keep only user marker

      // Add nearby users markers (green)
      nearbyUsers.forEach((user) => {
        const userIcon = L.default.divIcon({
          className: 'custom-marker nearby-marker',
          html: `<div style="
            width: 25px;
            height: 25px;
            background-color: #10b981;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [25, 25],
          iconAnchor: [12.5, 12.5],
        })

        const marker = L.default.marker([user.latitude, user.longitude], {
          icon: userIcon,
        }).addTo(mapRef.current!)

        const popup = L.default.popup().setContent(`
          <div style="text-align: center;">
            <strong>${user.name}</strong><br/>
            <span style="font-size: 12px; color: #666;">${user.email}</span>
          </div>
        `)
        marker.bindPopup(popup)
        markersRef.current.push(marker)
      })

      // Fit map to show all markers
      if (markersRef.current.length > 0) {
        const group = new L.default.FeatureGroup(markersRef.current)
        mapRef.current.fitBounds(group.getBounds().pad(0.1))
      }
    })
  }, [nearbyUsers])

  return (
    <div
      ref={mapContainerRef}
      style={{ height: '500px', width: '100%', borderRadius: '8px', zIndex: 0 }}
    />
  )
}
