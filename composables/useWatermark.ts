export const useWatermark = () => {
  const createWatermarkedImage = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Cannot get canvas context'))
          return
        }
        
        // Set canvas size to image size
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw original image
        ctx.drawImage(img, 0, 0)
        
        // Configure watermark style
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Center watermark
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(-45 * Math.PI / 180)
        ctx.fillText('Bentoshop Idol', 0, 0)
        ctx.restore()
        
        // Diagonal watermarks pattern
        const watermarkText = 'Bentoshop Idol'
        ctx.font = 'bold 32px Arial'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
        
        const spacing = 200
        for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
          for (let x = -canvas.width; x < canvas.width * 2; x += spacing * 2) {
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(-45 * Math.PI / 180)
            ctx.fillText(watermarkText, 0, 0)
            ctx.restore()
          }
        }
        
        // Corner watermarks
        ctx.font = 'bold 24px Arial'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
        ctx.textAlign = 'left'
        ctx.fillText('Bentoshop Idol', 20, 40)
        ctx.textAlign = 'right'
        ctx.fillText('Bentoshop Idol', canvas.width - 20, 40)
        ctx.textAlign = 'left'
        ctx.fillText('Bentoshop Idol', 20, canvas.height - 20)
        ctx.textAlign = 'right'
        ctx.fillText('Bentoshop Idol', canvas.width - 20, canvas.height - 20)
        
        // Convert to data URL
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = imageUrl
    })
  }
  
  return {
    createWatermarkedImage
  }
}
