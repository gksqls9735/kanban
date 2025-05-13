import { useState } from "react";
import { UrlData } from "../../../../types/type";
import { PORT } from "../../../../constants";

const UrlField: React.FC<{
  urls: UrlData[];
}> = ({ urls }) => {

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const linksToShow = isExpanded ? urls : urls.slice(0, 3);
  const hiddenLinkCount = urls.length - 3;
  return (
    <>
      <li style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 80, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>url</div>
        <ul style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {linksToShow.map(url => {
            const proxiedFavicon = url.faviconUrl
              ? `http://localhost:${PORT}/api/proxy-favicon?url=${encodeURIComponent(url.faviconUrl)}`
              : undefined;
            return (
              <li key={url.urlId} style={{
                height: 24, maxWidth: 160, padding: '4px 6px',
                display: 'flex', gap: 4, alignItems: 'center',
                border: '1px solid #E4E8EE', borderRadius: 4, boxSizing: 'border-box'
              }}>
                {proxiedFavicon ? (
                  <img src={proxiedFavicon} style={{ width: 16, padding: '1px 0px' }} />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 -960 960 960" width="1em" fill="#9CA3AF">
                    <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z" />
                  </svg>
                )}
                <a className="truncate" href={url.requestedUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-block', flex: 1,
                    fontSize: 13, fontWeight: 400, color: '#0F1B2A',
                    textDecoration: 'underline', textDecorationSkipInk: 'auto',
                  }}
                >{url.title}</a>
              </li>
            )
          })}
          {hiddenLinkCount > 0 && (
            <li onClick={() => setIsExpanded(prev => !prev)} style={{ color: '#8D99A8', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
              {isExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#8D99A8" className="bi bi-dash" viewBox="0 0 16 16">
                  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                </svg>
              ) : (
                <>
                  <div style={{ width: 'fit-content', height: 'fit-content' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#8D99A8" className="bi bi-plus-lg" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, textAlign: 'center' }}>{hiddenLinkCount}</div>
                </>
              )}
            </li>
          )}
        </ul>
      </li>
    </>
  );
};

export default UrlField;