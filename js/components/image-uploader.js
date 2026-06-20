/**
 * 图片上传组件 — 大学生心情记录助手
 * 支持图片选择、预览、压缩，限制最多3张
 * 集成 ImageProcessor 进行校验和压缩
 */

class ImageUploader {
  /**
   * @param {HTMLElement} container - 组件容器
   * @param {EventBus} eventBus - 事件总线
   */
  constructor(container, eventBus) {
    this._container = container;
    this._eventBus = eventBus;
    this._images = []; // 存储Base64编码的图片
    this._processor = new ImageProcessor();
    this._onChange = null;
    this._wrapper = null;
    this._fileInput = null;
  }

  /**
   * 渲染图片上传组件
   * @param {Function} onChange - 图片变化回调函数，参数为当前图片列表
   */
  render(onChange) {
    this._onChange = onChange;
    this._renderUploader();
  }

  /**
   * 获取当前图片列表
   * @returns {Array<string>} Base64编码的图片列表
   */
  getImages() {
    return [...this._images];
  }

  /**
   * 设置图片列表（用于编辑模式）
   * @param {Array<string>} images - Base64编码的图片列表
   */
  setImages(images) {
    this._images = Array.isArray(images) ? [...images] : [];
    this._updateUI();
  }

  /**
   * 渲染上传组件
   * @private
   */
  _renderUploader() {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-uploader';
    this._wrapper = wrapper;

    // 创建隐藏的文件输入
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/gif';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => this._handleFileSelect(e));
    this._fileInput = fileInput;

    wrapper.appendChild(fileInput);

    this._updateUI();
    this._container.innerHTML = '';
    this._container.appendChild(wrapper);
  }

  /**
   * 更新UI状态
   * @private
   */
  _updateUI() {
    if (!this._wrapper) return;

    // 清空现有内容（保留隐藏的file input）
    const fileInput = this._fileInput;
    this._wrapper.innerHTML = '';
    if (fileInput) {
      this._wrapper.appendChild(fileInput);
    }

    // 已上传的图片预览
    this._images.forEach((src, index) => {
      const preview = document.createElement('div');
      preview.className = 'image-uploader__preview';

      const img = document.createElement('img');
      img.src = src;
      img.alt = `图片${index + 1}`;
      img.loading = 'lazy';

      const removeBtn = document.createElement('div');
      removeBtn.className = 'image-uploader__remove';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._removeImage(index);
      });

      preview.appendChild(img);
      preview.appendChild(removeBtn);
      this._wrapper.appendChild(preview);
    });

    // 添加按钮（未达到最大数量时显示）
    if (this._images.length < AppConstants.MAX_IMAGES) {
      const addBtn = document.createElement('div');
      addBtn.className = 'image-uploader__add';

      const addIcon = document.createElement('span');
      addIcon.className = 'image-uploader__add-icon';
      addIcon.textContent = '+';

      const addLabel = document.createElement('span');
      addLabel.className = 'image-uploader__add-label';
      addLabel.textContent = `${this._images.length}/${AppConstants.MAX_IMAGES}`;

      addBtn.appendChild(addIcon);
      addBtn.appendChild(addLabel);

      addBtn.addEventListener('click', () => this._pickImage());
      this._wrapper.appendChild(addBtn);
    }
  }

  /**
   * 触发文件选择
   * @private
   */
  _pickImage() {
    if (this._images.length >= AppConstants.MAX_IMAGES) {
      Toast.show(`最多上传${AppConstants.MAX_IMAGES}张图片`, 'warning');
      return;
    }
    if (this._fileInput) {
      this._fileInput.value = ''; // 重置以允许选择相同文件
      this._fileInput.click();
    }
  }

  /**
   * 处理文件选择
   * @param {Event} e - 文件选择事件
   * @private
   */
  async _handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 检查数量限制
    if (this._images.length >= AppConstants.MAX_IMAGES) {
      Toast.show(`最多上传${AppConstants.MAX_IMAGES}张图片`, 'warning');
      return;
    }

    // 校验文件
    const validation = this._processor.validateFile(file);
    if (!validation.valid) {
      Toast.show(validation.error, 'error');
      return;
    }

    // 压缩并添加图片
    try {
      const base64 = await this._processor.compress(file);
      this._images.push(base64);
      this._updateUI();
      if (this._onChange) {
        this._onChange(this._images);
      }
    } catch (err) {
      console.error('[ImageUploader] 图片处理失败:', err);
      Toast.show('图片处理失败，请重新选择', 'error');
    }
  }

  /**
   * 删除图片
   * @param {number} index - 图片索引
   * @private
   */
  _removeImage(index) {
    if (index < 0 || index >= this._images.length) return;
    this._images.splice(index, 1);
    this._updateUI();
    if (this._onChange) {
      this._onChange(this._images);
    }
  }

  /**
   * 重置组件
   */
  reset() {
    this._images = [];
    this._updateUI();
    if (this._onChange) {
      this._onChange(this._images);
    }
  }
}

/* 将 ImageUploader 挂载到全局 */
window.ImageUploader = ImageUploader;
