/**
 * 图片处理器 — 大学生心情记录助手
 * 使用Canvas API进行图片压缩与处理
 */

class ImageProcessor {
  /**
   * 压缩图片
   * 使用Canvas API进行等比缩放压缩，自动将PNG/GIF转为JPEG以减小体积
   * @param {File} file - 图片文件
   * @param {number} [maxWidth=800] - 最大宽度
   * @param {number} [quality=0.7] - JPEG质量 (0-1)
   * @returns {Promise<string>} Base64编码的图片 (data:image/jpeg;base64,...)
   */
  compress(file, maxWidth = AppConstants.IMAGE_COMPRESS_MAX_WIDTH, quality = AppConstants.IMAGE_COMPRESS_QUALITY) {
    return new Promise((resolve, reject) => {
      // 先校验文件
      const validation = this.validateFile(file);
      if (!validation.valid) {
        reject(new Error(validation.error));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // 等比缩放：仅当宽度超过maxWidth时才缩放
            if (width > maxWidth) {
              const ratio = maxWidth / width;
              height = Math.round(height * ratio);
              width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            // 使用白色背景填充（处理PNG透明通道）
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // 统一输出为JPEG格式以减小体积
            const base64 = canvas.toDataURL('image/jpeg', quality);
            resolve(base64);
          } catch (error) {
            reject(new Error('图片压缩失败'));
          }
        };
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 校验文件
   * 检查文件格式和大小是否符合要求
   * @param {File} file - 图片文件
   * @returns {{valid: boolean, error?: string}} ValidationResult
   */
  validateFile(file) {
    if (!file) {
      return { valid: false, error: '未选择文件' };
    }

    // 校验文件格式
    if (!AppConstants.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: '仅支持JPG、PNG、GIF格式图片' };
    }

    // 校验文件大小
    if (file.size > AppConstants.MAX_IMAGE_SIZE) {
      return { valid: false, error: '图片大小不能超过2MB' };
    }

    return { valid: true };
  }

  /**
   * 将文件转为Base64编码（不压缩）
   * 直接读取文件为data URL，不进行任何压缩处理
   * @param {File} file - 图片文件
   * @returns {Promise<string>} Base64编码 (data:image/xxx;base64,...)
   */
  getBase64FromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('未选择文件'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          resolve(e.target.result);
        } else {
          reject(new Error('文件读取结果为空'));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }
}

/* 将 ImageProcessor 挂载到全局 */
window.ImageProcessor = ImageProcessor;
