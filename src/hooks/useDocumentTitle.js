import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | The Fellow` : 'The Fellow | Mitsubishi Customer Satisfaction Managers';
  }, [title]);
};
