const container = document.querySelector(`#canvas`)

const scene = new THREE.Scene()
const composer = new POSTPROCESSING.EffectComposer(new THREE.WebGLRenderer({
    logarithmicDepthBuffer: true,
    antialias: true
}))
const camera = new THREE.PerspectiveCamera( 50, container.offsetWidth / container.offsetHeight, 0.1, 1000 )

const hemisphere = new THREE.HemisphereLight( 0xd9efff, 0x313131, 0.8 )
const sun = new THREE.DirectionalLight( 0xE0D5FF, 1 )
const ambient = new THREE.AmbientLight( 0x303030 )
const pointlight = new THREE.PointLight( 0xffffff, 0.4, 100)
const pointlightBack = new THREE.PointLight( 0xffffff, 0.3, 100)

const plane = new THREE.Mesh( 
    new THREE.BoxGeometry( 1.5, 1.5, 1.5, 1.5 ), 
    new THREE.MeshLambertMaterial({ 
        map: new THREE.TextureLoader().load( "https://i.imgur.com/EEzXtVl.png" ), 
        color: 0xffffff
    })
)

const background = new THREE.Mesh( 
    new THREE.PlaneBufferGeometry( 40, 40, 40, 40 ), 
    new THREE.MeshLambertMaterial({ 
        color: 0x90708
    })
)

composer.setSize( container.offsetWidth/1.2, container.offsetHeight/1.2 )
composer.renderer.setSize( container.offsetWidth, container.offsetHeight )

camera.position.z = 6
camera.position.y = 0.1
sun.position.set( 0, 0.5, 4 )
plane.position.set( 0, 0, 0 )
background.position.set( 0, 0, -2 )
pointlight.position.set( -4, 0, 12 )
pointlightBack.position.set( 3, 3, 2 )

let x = 0, y = 0, z = 0

setInterval (() => {
    y-= 0.005
    x+= 0.003
    plane.rotation.set( x, y, z )
}, 16)

sun.castShadow = true

scene.add( ambient, hemisphere, sun, pointlight, pointlightBack, plane, background )

const scanlineEffect = new POSTPROCESSING.ScanlineEffect({
    blendFunction: POSTPROCESSING.BlendFunction.ALPHA,
    density: 1
})

const noiseEffect = new POSTPROCESSING.NoiseEffect({ 
    blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE 
})

const chromaticAberrationEffect = new POSTPROCESSING.ChromaticAberrationEffect({
    offset: new THREE.Vector2(0, 0)
})

scanlineEffect.blendMode.opacity.value = 0.02
noiseEffect.blendMode.opacity.value = 0.08

const effectPass = new POSTPROCESSING.EffectPass( camera, scanlineEffect, noiseEffect, chromaticAberrationEffect )
effectPass.renderToScreen = true


const glitchEffect = new POSTPROCESSING.GlitchEffect({
    chromaticAberrationOffset: chromaticAberrationEffect.offset
})

glitchEffect.mode = 3

const glitchPass = new POSTPROCESSING.EffectPass(camera, glitchEffect, noiseEffect);

composer.addPass(new POSTPROCESSING.RenderPass(scene, camera))
composer.addPass(effectPass)
// composer.addPass(glitchPass)

chromaticAberrationEffect.offset.x = 0.002
chromaticAberrationEffect.offset.y = 0.002

let chromaUp = 1, offset = 0

const ease = t => t<.6 ? 8*t*t*t*t : 1-8*(--t)*t*t*t


setInterval(() => {
    if (offset <= 0) chromaUp = 1
    if (offset >= 1) chromaUp = -1

    offset += 0.03 * chromaUp + (Math.random()/10 - 0.03)

    chromaticAberrationEffect.offset.x = ease(offset/5)

    plane.scale.set( ease(offset/8)*100+1, ease(offset/8)*100+1, ease(offset/8)*100+1, ease(offset/8)*100+1 )
},16)

const clock = new THREE.Clock()

const animate = () => {
    requestAnimationFrame( animate )
    composer.render( clock.getDelta() )
}

animate()

document.querySelector(`#canvas`).appendChild(composer.renderer.domElement)