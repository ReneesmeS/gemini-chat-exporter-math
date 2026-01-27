from PIL import Image, ImageDraw

sizes = [16, 48, 128]
for size in sizes:
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    if size >= 48:
        arrow_width = size // 3
        arrow_head = size // 4
        center_x = size // 2
        shaft_width = arrow_width // 3
        
        draw.rectangle(
            [(center_x - shaft_width//2, size//4), 
             (center_x + shaft_width//2, size*2//3)],
            fill='white'
        )
        
        points = [
            (center_x, size*3//4),
            (center_x - arrow_head, size//2),
            (center_x + arrow_head, size//2),
        ]
        draw.polygon(points, fill='white')
    
    img.save(f'icon{size}.png')
    print(f'Created icon{size}.png')

print('All icons created!')
