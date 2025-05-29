import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
}

const LinkPreview: React.FC<{ link: string }> = ({ link }) => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string>('');
  const apiKey = import.meta.env.VITE_LINK_PREVIEW_API_KEY;

  const fetchPreview = async (urlToFetch: string) => {
    setError('');
    setPreviewData(null);
    if (!apiKey) {
      setError('API 키가 설정되지 않았습니다.');
      console.error('LinkPreview API key is not set.');
      return;
    }
    if (!urlToFetch) {
      setError('유효한 URL이 아닙니다.');
      return;
    }

    try {
      const response = await axios.get('https://api.linkpreview.net', {
        params: { key: apiKey, q: urlToFetch },
      });

      const data = response.data;

      if (data.error) {
        setError(data.description || '링크 미리보기를 가져오는데 실패했습니다.');
        console.error('LinkPreview API error:', data);
        setPreviewData(null);
      } else {
        setPreviewData({
          title: data.title || '제목 없음',
          description: data.description || '설명 없음',
          image: data.image || '',
          url: data.url || urlToFetch,
        });
        setError('');
      }
    } catch (err) {
      console.error('Error fetching link preview:', err);
      setError('링크 프리뷰를 가져오는 중 네트워크 오류가 발생했습니다.');
      setPreviewData(null);
    }
  };

  useEffect(() => {
    if (link) {
      fetchPreview(link);
    }
  }, [link]);

  if (error) {
    return (
      <div className="link-preview-wrapper link-preview-error-wrapper">
        <p className="link-preview-error-message">
          {error} <a href={link} target="_blank" rel="noopener noreferrer" className="link-preview-original-link">원본 링크 보기</a>
        </p>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="link-preview-wrapper link-preview-loading">
        <p>미리보기 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="link-preview-wrapper">
      <a href={previewData.url} target="_blank" rel="noopener noreferrer" className="link-preview-container">
        {previewData.image && (
          <div className="link-preview-image-container">
            <img src={previewData.image} alt={previewData.title || 'link preview'} className="link-preview-image" />
          </div>
        )}
        <div className="link-preview-content">
          <h3 className="link-preview-title">{previewData.title}</h3>
          <p className="link-preview-description">{previewData.description}</p>
          <p className="link-preview-url">{new URL(previewData.url).hostname}</p>
        </div>
      </a>
    </div>
  );
};

export default LinkPreview;