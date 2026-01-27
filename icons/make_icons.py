import struct
import zlib

def create_png(size, filename):
    """Create a simple solid color PNG"""
    width, height = size, size
    color = (102, 126, 234)  # #667eea (purple-blue)
    
    # PNG signature
    data = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk (image header)
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    data += struct.pack('>I', 13) + b'IHDR' + ihdr
    data += struct.pack('>I', zlib.crc32(b'IHDR' + ihdr) & 0xffffffff)
    
    # IDAT chunk (pixel data)
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # filter type (none)
        for x in range(width):
            raw_data += bytes(color)
    
    compressed = zlib.compress(raw_data)
    data += struct.pack('>I', len(compressed)) + b'IDAT' + compressed
    data += struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff)
    
    # IEND chunk (end of image)
    data += struct.pack('>I', 0) + b'IEND'
    data += struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff)
    
    # Write to file
    with open(filename, 'wb') as f:
        f.write(data)
    print(f'Created {filename} ({size}x{size})')

# Create all three icon sizes
create_png(16, 'icon16.png')
create_png(48, 'icon48.png')
create_png(128, 'icon128.png')

print('\nAll icons created successfully!')
