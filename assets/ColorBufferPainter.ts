import {
  _decorator,
  Component,
  Sprite,
  Texture2D,
  ImageAsset,
  Vec2,
  Color,
  SpriteFrame,
  director,
  Material,
  EffectAsset,
  gfx,
} from "cc";
const { ccclass, property } = _decorator;
const size = 32;

@ccclass("ColorBufferPainter")
export class ColorBufferPainter extends Component {
  @property(SpriteFrame)
  baseSpriteFrame: SpriteFrame = null!;
  @property(Sprite)
  sprite: Sprite = null!;
  @property(EffectAsset)
  effect: EffectAsset = null!;

  onLoad() {
    this.parse();
  }

  parse() {
    // Create ImageAsset from raw data
    const width = 32;
    const height = 32;
    // const buffer = this.readPixelsFromSpriteFrame(this.baseSpriteFrame);
    const buffer = new Uint8Array(width * height * 4);

    // Fill the buffer with red for testing
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i + 0] = 255; // R
      buffer[i + 1] = 0; // G
      buffer[i + 2] = 0; // B
      buffer[i + 3] = 255; // A
    }

    const image = new ImageAsset({
      _data: buffer,
      _compressed: false,
      width: width,
      height: height,
      format: Texture2D.PixelFormat.RGBA8888,
    });
    // image._data = buffer;
    // image._width = width;
    // image._height = height;
    // image._format = Texture2D.PixelFormat.RGBA8888;
    const texture = new Texture2D(); //size, pixel format and mipmap images.
    texture.setFilters(Texture2D.Filter.NEAREST, Texture2D.Filter.NEAREST);
    texture.image = image;
    // Send to shader
    const newMat = new Material();
    newMat.initialize({
      effectAsset: this.effect,
    });
    newMat.setProperty("dataMap", texture);
    this.sprite.setSharedMaterial(newMat, 0);
  }

  public readPixelsFromSpriteFrame(spriteFrame: SpriteFrame): Uint8Array {
    let buffer: Uint8Array = null;
    if (!buffer) {
      let texture = spriteFrame.texture;
      let tx = spriteFrame.rect.x;
      let ty = spriteFrame.rect.y;
      if (spriteFrame.packable && spriteFrame.original) {
        texture = spriteFrame.original._texture;
        tx = spriteFrame.original._x;
        ty = spriteFrame.original._y;
      }
      let width = spriteFrame.rect.width;
      let height = spriteFrame.rect.height;

      let gfxTexture = texture.getGFXTexture();
      let gfxDevice = texture["_getGFXDevice"]();
      let bufferViews = [];
      let region = new gfx.BufferTextureCopy();
      buffer = new Uint8Array(width * height * 4);
      (region.texOffset.x = tx), (region.texOffset.y = ty);
      region.texExtent.width = width;
      region.texExtent.height = height;
      bufferViews.push(buffer);
      gfxDevice?.copyTextureToBuffers(gfxTexture, bufferViews, [region]);
    }

    return buffer;
  }
}
