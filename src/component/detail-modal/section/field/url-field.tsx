import { useState } from "react";
import { UrlData } from "../../../../types/type";
import { PORT } from "../../../../constants";
import ExpandToggle from "../../common/expand-toggle";

const UrlField: React.FC<{
  urls: UrlData[];
}> = ({ urls }) => {

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const linksToShow = isExpanded ? urls : urls.slice(0, 3);
  const hiddenCount = urls.length - 3;
  return (
    <>
      <li className="task-detail__detail-modal-field-item">
        <div className="task-detail__detail-modal-field-label">url</div>
        <ul className="task-detail__detail-modal-field-content-list">
          {linksToShow.map(url => {
            const proxiedFavicon = url.faviconUrl
              ? `http://localhost:${PORT}/api/proxy-favicon?url=${encodeURIComponent(url.faviconUrl)}`
              : undefined;
            return (
              <li key={url.urlId} className="task-detail__detail-modal-field-value-item">
                {proxiedFavicon ? (
                  <img src={proxiedFavicon} className="task-detail__detail-modal-field-value-item-url-favicon"/>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 -960 960 960" width="1em" fill="#9CA3AF">
                    <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z" />
                  </svg>
                )}
                <a className="truncate task-detail__detail-modal-field-value-item-url-link" href={url.requestedUrl} target="_blank" rel="noopener noreferrer">
                  {url.title}</a>
              </li>
            )
          })}
          <ExpandToggle hiddenCount={hiddenCount} toggle={() => setIsExpanded(prev => !prev)} isExpanded={isExpanded}/>
        </ul>
      </li>
    </>
  );
};

export default UrlField;