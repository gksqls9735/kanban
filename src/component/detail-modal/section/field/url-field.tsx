import { useState } from "react";
import { UrlData } from "../../../../types/type";
import ExpandToggle from "../../common/expand-toggle";
import FieldLabel from "./field-label";

const UrlField: React.FC<{
  urls: UrlData[];
}> = ({ urls }) => {

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const linksToShow = isExpanded ? urls : urls.slice(0, 3);
  const hiddenCount = urls.length - 3;
  return (
    <>
      <li className="task-detail__detail-modal-field-item">
        <FieldLabel fieldName="url"/>
        <ul className="task-detail__detail-modal-field-content-list">
          {linksToShow.map(url => {
            return (
              <li key={url.urlId} className="task-detail__detail-modal-field-value-item">
                <img src={`https://www.google.com/s2/favicons?sz=256&domain_url=${url.requestedUrl}`} className="task-detail__detail-modal-field-value-item-url-favicon" />
                <a className="truncate task-detail__detail-modal-field-value-item-url-link" href={url.requestedUrl} target="_blank" rel="noopener noreferrer">
                  {url.title}</a>
              </li>
            )
          })}
          <ExpandToggle hiddenCount={hiddenCount} toggle={() => setIsExpanded(prev => !prev)} isExpanded={isExpanded} />
        </ul>
      </li>
    </>
  );
};

export default UrlField;