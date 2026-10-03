'use client'

import { useEffect, useRef, useState } from 'react'

export function CampusArtifact() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let mounted = false
    let visible = false
    let updateScene = () => {}
    let disposeScene = () => {}

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !mounted) {
        mounted = true
        void mountScene()
      } else {
        updateScene()
      }
    }, { rootMargin: '160px' })

    async function mountScene() {
      const THREE = await import('three')
      if (disposed || !host) return

      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
      } catch {
        return // Keep the illustration visible when WebGL is unavailable.
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.25
      renderer.domElement.setAttribute('aria-hidden', 'true')
      renderer.domElement.className = 'artifact-webgl'
      host.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
      camera.position.set(0, 1.5, 9.5)
      camera.lookAt(0, 0, 0)
      const collection = new THREE.Group()
      const books = new THREE.Group()
      const mugLeft = new THREE.Group()
      const mugRight = new THREE.Group()
      collection.add(books, mugLeft, mugRight)
      scene.add(collection)

      type MeshGeometry = NonNullable<ConstructorParameters<typeof THREE.Mesh>[0]>
      const geometries: MeshGeometry[] = []
      const materials: InstanceType<typeof THREE.MeshPhysicalMaterial>[] = []
      const material = (color: string, roughness = 0.55) => {
        const item = new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0.04, clearcoat: 0.2, side: THREE.DoubleSide })
        materials.push(item)
        return item
      }
      const coverColors = ['#0d2b6c', '#3265ba', '#e8edf5', '#183b83', '#a9c0e7']
      const covers = coverColors.map((color) => material(color, 0.66))
      const paper = material('#f7f4e9', 0.82)
      const paperEdge = material('#d9d6ce', 0.9)
      const spineAccent = material('#d3e1ff', 0.6)
      const mugBlue = material('#17459a', 0.29)
      const mugIvory = material('#bdcfe8', 0.34)
      const coffee = material('#493a36', 0.27)
      const addMesh = (parent: InstanceType<typeof THREE.Group>, geometry: MeshGeometry, finish: InstanceType<typeof THREE.MeshPhysicalMaterial>) => {
        geometries.push(geometry)
        const mesh = new THREE.Mesh(geometry, finish)
        parent.add(mesh)
        return mesh
      }

      coverColors.forEach((_, index) => {
        const book = new THREE.Group()
        book.position.set([0, -0.1, 0.07, -0.06, 0.12][index], -1.56 + index * 0.37, [0, 0.04, -0.04, 0.02, 0][index])
        book.rotation.y = [0.08, -0.11, 0.13, -0.08, 0.1][index]
        book.rotation.z = [0.015, -0.025, 0.015, 0.02, -0.02][index]
        const width = [2.55, 2.7, 2.53, 2.63, 2.45][index]
        const depth = [1.65, 1.6, 1.74, 1.57, 1.62][index]
        const topCover = addMesh(book, new THREE.BoxGeometry(width, 0.045, depth), covers[index])
        topCover.position.y = 0.135
        const bottomCover = addMesh(book, new THREE.BoxGeometry(width, 0.045, depth), covers[index])
        bottomCover.position.y = -0.135
        const pages = addMesh(book, new THREE.BoxGeometry(width - 0.14, 0.225, depth - 0.09), paper)
        pages.position.set(0.07, 0, 0.025)
        const foreEdge = addMesh(book, new THREE.BoxGeometry(0.008, 0.19, depth - 0.13), paperEdge)
        foreEdge.position.x = width / 2 - 0.008
        const spine = addMesh(book, new THREE.BoxGeometry(0.135, 0.31, depth), covers[index])
        spine.position.x = -width / 2 + 0.067
        const spineLine = addMesh(book, new THREE.BoxGeometry(0.009, 0.24, depth - 0.21), spineAccent)
        spineLine.position.x = -width / 2 + 0.14
        books.add(book)
      })

      const makeMug = (group: InstanceType<typeof THREE.Group>, finish: InstanceType<typeof THREE.MeshPhysicalMaterial>, handleSide: -1 | 1) => {
        const profile = [
          new THREE.Vector2(0, 0.13), new THREE.Vector2(0.36, 0.13),
          new THREE.Vector2(0.4, 0.19), new THREE.Vector2(0.42, 1.04),
          new THREE.Vector2(0.46, 1.08), new THREE.Vector2(0.49, 1.04),
          new THREE.Vector2(0.47, 0.08), new THREE.Vector2(0.4, 0), new THREE.Vector2(0, 0),
        ]
        addMesh(group, new THREE.LatheGeometry(profile, 48), finish)
        const rim = addMesh(group, new THREE.TorusGeometry(0.455, 0.028, 10, 48), finish)
        rim.rotation.x = Math.PI / 2
        rim.position.y = 1.055
        const liquid = addMesh(group, new THREE.CircleGeometry(0.35, 48), coffee)
        liquid.rotation.x = -Math.PI / 2
        liquid.position.y = 0.81
        const handle = addMesh(group, new THREE.TorusGeometry(0.29, 0.083, 12, 40), finish)
        handle.position.set(handleSide * 0.58, 0.59, 0)
        handle.scale.x = 0.87
      }
      makeMug(mugLeft, mugIvory, -1)
      makeMug(mugRight, mugBlue, 1)
      mugLeft.position.set(-2.03, -1.02, 0.55)
      mugRight.position.set(1.98, -0.75, -0.25)

      scene.add(new THREE.AmbientLight('#ffffff', 1.4))
      const key = new THREE.DirectionalLight('#ffffff', 2.7)
      key.position.set(-3, 6, 7)
      scene.add(key)
      const fill = new THREE.DirectionalLight('#a9c7ff', 1.5)
      fill.position.set(4, 1, -3)
      scene.add(fill)

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      let frame = 0
      let lastTime = 0
      let progress = 0.5
      let targetProgress = 0.5
      let pointerX = 0
      let pointerY = 0
      let targetPointerX = 0
      let targetPointerY = 0
      const pose = (position: number, time: number) => {
        const scroll = position - 0.5
        const drift = reduceMotion.matches ? 0 : Math.sin(time * 0.00075)
        const counterDrift = reduceMotion.matches ? 0 : Math.sin(time * 0.00092 + 1.6)
        books.rotation.x = scroll * 0.24
        books.rotation.y = scroll * 1.05 + drift * 0.045
        books.rotation.z = scroll * 0.2
        books.position.y = scroll * 0.62 + drift * 0.05
        mugLeft.position.x = -2.03 - scroll * 0.33
        mugLeft.position.y = -1.02 + scroll * 1.45 + counterDrift * 0.07
        mugLeft.position.z = 0.55 + scroll * 0.38
        mugLeft.rotation.z = scroll * 0.42
        mugLeft.rotation.y = -0.2 + scroll * 0.72
        mugRight.position.x = 1.98 + scroll * 0.35
        mugRight.position.y = -0.75 - scroll * 1.22 + drift * 0.08
        mugRight.position.z = -0.25 - scroll * 0.44
        mugRight.rotation.z = -scroll * 0.36
        mugRight.rotation.y = 0.24 + scroll * 0.8
        collection.rotation.x = pointerX
        collection.rotation.y = scroll * 0.16 + pointerY
      }
      const animate = (time: number) => {
        if (!visible || disposed || reduceMotion.matches) {
          frame = 0
          return
        }
        const delta = Math.min((time - (lastTime || time)) / 1000, 0.05)
        lastTime = time
        progress += (targetProgress - progress) * Math.min(delta * 7, 1)
        pointerX += (targetPointerX - pointerX) * Math.min(delta * 5, 1)
        pointerY += (targetPointerY - pointerY) * Math.min(delta * 5, 1)
        pose(progress, time)
        renderer.render(scene, camera)
        frame = requestAnimationFrame(animate)
      }
      updateScene = () => {
        const rect = host.getBoundingClientRect()
        targetProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)))
        if (!visible || reduceMotion.matches) {
          if (frame) cancelAnimationFrame(frame)
          frame = 0
          lastTime = 0
          pose(reduceMotion.matches ? 0.5 : targetProgress, 0)
          renderer.render(scene, camera)
          return
        }
        if (!frame) frame = requestAnimationFrame(animate)
      }
      const resize = () => {
        const width = host.clientWidth
        const height = host.clientHeight
        if (!width || !height) return
        camera.aspect = width / height
        camera.position.z = width < 480 ? 10.7 : 9.5
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
        updateScene()
      }
      const resizeObserver = new ResizeObserver(resize)
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      const onPointerMove = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect()
        targetPointerY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.22
        targetPointerX = ((event.clientY - rect.top) / rect.height - 0.5) * 0.14
      }
      const onPointerLeave = () => { targetPointerX = 0; targetPointerY = 0 }
      resizeObserver.observe(host)
      window.addEventListener('scroll', updateScene, { passive: true })
      reduceMotion.addEventListener('change', updateScene)
      if (finePointer) {
        host.addEventListener('pointermove', onPointerMove)
        host.addEventListener('pointerleave', onPointerLeave)
      }
      resize()
      setReady(true)
      updateScene()

      disposeScene = () => {
        if (frame) cancelAnimationFrame(frame)
        resizeObserver.disconnect()
        window.removeEventListener('scroll', updateScene)
        reduceMotion.removeEventListener('change', updateScene)
        host.removeEventListener('pointermove', onPointerMove)
        host.removeEventListener('pointerleave', onPointerLeave)
        geometries.forEach((geometry) => geometry.dispose())
        materials.forEach((finish) => finish.dispose())
        renderer.dispose()
        renderer.domElement.remove()
      }
    }

    observer.observe(host)
    return () => {
      disposed = true
      observer.disconnect()
      disposeScene()
    }
  }, [])

  return <div className={`artifact-visual${ready ? ' artifact-ready' : ''}`} aria-label="Livros e duas canecas tridimensionais se movem separadamente conforme a página rola" role="img">
    <div className="artifact-fallback" aria-hidden="true"><div className="fallback-books"><span /><span /><span /><span /><span /></div><span className="fallback-mug fallback-mug-left" /><span className="fallback-mug fallback-mug-right" /></div>
    <div className="artifact-canvas" ref={hostRef} aria-hidden="true" />
  </div>
}
