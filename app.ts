/**
 * 图片处理工具
 * 提供图片尺寸调整和质量压缩功能
 */

interface ImageInfo {
    width: number;
    height: number;
    size: number;
    format: string;
}

class ImageProcessor {
    private originalImage: HTMLImageElement | null = null;
    private processedImageDataUrl: string | null = null;
    private originalImageInfo: ImageInfo | null = null;
    private processedImageInfo: ImageInfo | null = null;
    
    // DOM元素
    private imageInput: HTMLInputElement;
    private originalImageEl: HTMLImageElement;
    private processedImageEl: HTMLImageElement;
    private originalInfoEl: HTMLDivElement;
    private processedInfoEl: HTMLDivElement;
    private presetSizeSelect: HTMLSelectElement;
    private widthInput: HTMLInputElement;
    private heightInput: HTMLInputElement;
    private keepAspectRatio: HTMLInputElement;
    private qualityInput: HTMLInputElement;
    private qualityValue: HTMLSpanElement;
    private formatSelect: HTMLSelectElement;
    private targetSizeInput: HTMLInputElement;
    private processBtn: HTMLButtonElement;
    private downloadBtn: HTMLButtonElement;
    private imageSettings: HTMLDivElement;
    
    constructor() {
        // 获取DOM元素
        this.imageInput = document.getElementById('imageInput') as HTMLInputElement;
        this.originalImageEl = document.getElementById('originalImage') as HTMLImageElement;
        this.processedImageEl = document.getElementById('processedImage') as HTMLImageElement;
        this.originalInfoEl = document.getElementById('originalInfo') as HTMLDivElement;
        this.processedInfoEl = document.getElementById('processedInfo') as HTMLDivElement;
        this.presetSizeSelect = document.getElementById('presetSizeSelect') as HTMLSelectElement;
        this.widthInput = document.getElementById('widthInput') as HTMLInputElement;
        this.heightInput = document.getElementById('heightInput') as HTMLInputElement;
        this.keepAspectRatio = document.getElementById('keepAspectRatio') as HTMLInputElement;
        this.qualityInput = document.getElementById('qualityInput') as HTMLInputElement;
        this.qualityValue = document.getElementById('qualityValue') as HTMLSpanElement;
        this.formatSelect = document.getElementById('formatSelect') as HTMLSelectElement;
        this.targetSizeInput = document.getElementById('targetSizeInput') as HTMLInputElement;
        this.processBtn = document.getElementById('processBtn') as HTMLButtonElement;
        this.downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;
        this.imageSettings = document.getElementById('imageSettings') as HTMLDivElement;
        
        // 初始化事件监听
        this.initEventListeners();
    }
    
    /**
     * 初始化所有事件监听器
     */
    private initEventListeners(): void {
        this.imageInput.addEventListener('change', this.handleImageUpload.bind(this));
        this.presetSizeSelect.addEventListener('change', this.handlePresetSizeChange.bind(this));
        this.widthInput.addEventListener('input', this.handleDimensionChange.bind(this, 'width'));
        this.heightInput.addEventListener('input', this.handleDimensionChange.bind(this, 'height'));
        this.qualityInput.addEventListener('input', this.updateQualityValue.bind(this));
        this.processBtn.addEventListener('click', this.processImage.bind(this));
        this.downloadBtn.addEventListener('click', this.downloadImage.bind(this));
    }
    
    /**
     * 处理上传的图片
     */
    private async handleImageUpload(event: Event): Promise<void> {
        const fileInput = event.target as HTMLInputElement;
        const files = fileInput.files;
        
        if (!files || files.length === 0) {
            return;
        }
        
        const file = files[0];
        
        try {
            // 检查文件类型
            if (!file.type.startsWith('image/')) {
                alert('请上传图片文件');
                return;
            }
            
            // 读取文件
            const dataUrl = await this.readFileAsDataURL(file);
            
            // 创建图片对象
            this.originalImage = await this.createImage(dataUrl);
            
            // 显示原始图片
            this.originalImageEl.src = dataUrl;
            
            // 获取并显示图片信息
            this.originalImageInfo = {
                width: this.originalImage.width,
                height: this.originalImage.height,
                size: file.size,
                format: file.type
            };
            
            this.displayImageInfo(this.originalInfoEl, this.originalImageInfo);
            
            // 设置默认处理参数
            this.widthInput.value = this.originalImage.width.toString();
            this.heightInput.value = this.originalImage.height.toString();
            this.presetSizeSelect.value = 'custom';
            
            // 显示设置面板
            this.imageSettings.style.display = 'block';
            
            // 优先选择与原图相同的格式
            Array.from(this.formatSelect.options).forEach(option => {
                if (option.value === file.type) {
                    this.formatSelect.value = file.type;
                }
            });
            
        } catch (error) {
            console.error('加载图片时出错:', error);
            alert('加载图片时出错');
        }
    }
    
    /**
     * 处理预设尺寸选择变化
     */
    private handlePresetSizeChange(): void {
        const selectedValue = this.presetSizeSelect.value;
        console.log('预设尺寸变化:', selectedValue);
        
        // 尺寸映射表
        const sizeMappings: {[key: string]: {width: number, height: number}} = {
            'oneinch': {width: 295, height: 413},
            'twoinch': {width: 413, height: 579},
            'smallone': {width: 260, height: 378},
            'passport': {width: 354, height: 472},
            'visa': {width: 390, height: 567},
            'idcard': {width: 358, height: 441}
        };
        
        // 如果选择了预设尺寸，则更新宽度和高度
        if (selectedValue !== 'custom' && sizeMappings[selectedValue]) {
            const size = sizeMappings[selectedValue];
            console.log('设置尺寸为:', size.width, 'x', size.height);
            this.widthInput.value = size.width.toString();
            this.heightInput.value = size.height.toString();
            
            // 手动触发输入事件，以便应用宽高比例的变化
            const inputEvent = new Event('input', { bubbles: true });
            this.widthInput.dispatchEvent(inputEvent);
        }
    }
    
    /**
     * 处理尺寸变化，保持宽高比
     */
    private handleDimensionChange(dimension: 'width' | 'height'): void {
        if (!this.originalImage || !this.keepAspectRatio.checked) {
            return;
        }
        
        const aspectRatio = this.originalImage.width / this.originalImage.height;
        
        if (dimension === 'width') {
            const newWidth = parseInt(this.widthInput.value);
            if (!isNaN(newWidth)) {
                this.heightInput.value = Math.round(newWidth / aspectRatio).toString();
            }
        } else {
            const newHeight = parseInt(this.heightInput.value);
            if (!isNaN(newHeight)) {
                this.widthInput.value = Math.round(newHeight * aspectRatio).toString();
            }
        }
    }
    
    /**
     * 更新质量值显示
     */
    private updateQualityValue(): void {
        this.qualityValue.textContent = this.qualityInput.value;
    }
    
    /**
     * 处理图片
     */
    private async processImage(): Promise<void> {
        if (!this.originalImage) {
            alert('请先上传图片');
            return;
        }
        
        // 获取参数
        const width = parseInt(this.widthInput.value);
        const height = parseInt(this.heightInput.value);
        const quality = parseInt(this.qualityInput.value) / 100;
        const format = this.formatSelect.value;
        const targetSize = parseFloat(this.targetSizeInput.value) * 1024 * 1024; // 转为字节
        
        try {
            // 调整图片大小
            const { dataUrl, imageInfo } = await this.resizeImage(this.originalImage, width, height, format, quality, targetSize);
            
            // 显示处理后的图片
            this.processedImageDataUrl = dataUrl;
            this.processedImageEl.src = dataUrl;
            this.processedImageInfo = imageInfo;
            
            // 显示图片信息
            this.displayImageInfo(this.processedInfoEl, this.processedImageInfo);
            
            // 启用下载按钮
            this.downloadBtn.disabled = false;
            
        } catch (error) {
            console.error('处理图片时出错:', error);
            alert('处理图片时出错');
        }
    }
    
    /**
     * 下载处理后的图片
     */
    private downloadImage(): void {
        if (!this.processedImageDataUrl) {
            return;
        }
        
        const filename = `processed_image.${this.getFileExtension(this.formatSelect.value)}`;
        const link = document.createElement('a');
        link.href = this.processedImageDataUrl;
        link.download = filename;
        link.click();
    }
    
    /**
     * 读取文件为DataURL
     */
    private readFileAsDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * 创建图片对象
     */
    private createImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
    
    /**
     * 调整图片大小
     */
    private async resizeImage(
        image: HTMLImageElement, 
        width: number, 
        height: number, 
        format: string,
        quality: number, 
        targetSize: number | null = null
    ): Promise<{ dataUrl: string, imageInfo: ImageInfo }> {
        // 创建canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图片
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('无法获取canvas上下文');
        }
        
        ctx.drawImage(image, 0, 0, width, height);
        
        // 调整质量以达到目标大小
        let currentQuality = quality;
        let dataUrl = canvas.toDataURL(format, currentQuality);
        let size = this.getDataUrlSize(dataUrl);
        
        // 如果指定了目标大小，尝试通过调整质量来达到
        if (targetSize && targetSize > 0) {
            let iterations = 0;
            const maxIterations = 10; // 最大迭代次数
            
            // 二分查找合适的质量值
            let minQuality = 0.01;
            let maxQuality = 1.0;
            
            while (Math.abs(size - targetSize) / targetSize > 0.05 && iterations < maxIterations) {
                iterations++;
                
                if (size > targetSize) {
                    // 如果当前大小大于目标大小，减小质量
                    maxQuality = currentQuality;
                    currentQuality = (minQuality + currentQuality) / 2;
                } else {
                    // 如果当前大小小于目标大小，增加质量
                    minQuality = currentQuality;
                    currentQuality = (currentQuality + maxQuality) / 2;
                }
                
                dataUrl = canvas.toDataURL(format, currentQuality);
                size = this.getDataUrlSize(dataUrl);
            }
        }
        
        // 获取调整后的图片信息
        const img = await this.createImage(dataUrl);
        const imageInfo: ImageInfo = {
            width: img.width,
            height: img.height,
            size: size,
            format: format
        };
        
        return { dataUrl, imageInfo };
    }
    
    /**
     * 获取DataURL的大小（字节）
     */
    private getDataUrlSize(dataUrl: string): number {
        // 移除URL前缀，如"data:image/jpeg;base64,"
        const base64 = dataUrl.split(',')[1];
        // Base64编码的数据大约是原始数据的4/3，去头后计算实际大小
        return Math.floor((base64.length * 3) / 4);
    }
    
    /**
     * 获取MIME类型对应的文件扩展名
     */
    private getFileExtension(mimeType: string): string {
        const extensions: { [key: string]: string } = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/gif': 'gif'
        };
        
        return extensions[mimeType] || 'jpg';
    }
    
    /**
     * 显示图片信息
     */
    private displayImageInfo(element: HTMLDivElement, info: ImageInfo): void {
        const sizeInKB = (info.size / 1024).toFixed(2);
        const sizeInMB = (info.size / (1024 * 1024)).toFixed(2);
        
        element.innerHTML = `
            <p>尺寸: ${info.width} × ${info.height} 像素</p>
            <p>格式: ${this.getFormatName(info.format)}</p>
            <p>大小: ${sizeInKB} KB (${sizeInMB} MB)</p>
        `;
    }
    
    /**
     * 获取格式的可读名称
     */
    private getFormatName(format: string): string {
        const formatNames: { [key: string]: string } = {
            'image/jpeg': 'JPEG',
            'image/png': 'PNG',
            'image/webp': 'WebP',
            'image/gif': 'GIF'
        };
        
        return formatNames[format] || format;
    }
}

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ImageProcessor();
}); 