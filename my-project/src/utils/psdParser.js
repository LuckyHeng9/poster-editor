import PSD from 'psd'

export const parsePSD = async (filePath) => {
  try {
    const psd = await PSD.open(filePath)
    const tree = psd.tree()
    
    // Extract layer information
    const layers = []
    tree.forEach((layer) => {
      layers.push({
        name: layer.name,
        type: layer.type,
        visible: layer.visible,
        opacity: layer.opacity,
        left: layer.left,
        top: layer.top,
        width: layer.width,
        height: layer.height,
      })
    })

    return {
      width: psd.width,
      height: psd.height,
      layers,
    }
  } catch (error) {
    console.error('Error parsing PSD:', error)
    return null
  }
}
