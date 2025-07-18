import useViewModeStore from "../../store/viewmode-store";
import { ViewModes } from "../../constant/constants";
import useDropdown from "../../hooks/use-dropdown";

import SettingIcon from "../../assets/setting.svg?react";
import FolderActive from "../../assets/folder-active.svg?react";
import Folder from "../../assets/folder.svg?react";

const ViewModeToggle: React.FC<{}> = ({ }) => {
  const { viewMode, setViewMode } = useViewModeStore();
  const { isOpen, wrapperRef, dropdownRef, toggle } = useDropdown();
  const isViewModeStatus = viewMode === ViewModes.STATUS;

  return (
    <>
      <div ref={wrapperRef} className={`view-mode-toggle__button ${isOpen ? 'view-mode-toggle__button--open' : ''}`}
        onClick={toggle}>
        <SettingIcon width="24" height="24"/>
      </div>
      {isOpen && (
        <div ref={dropdownRef} className="view-mode-toggle__dropdown">
          <div className="view-mode-toggle__content">
            <div className="view-mode-toggle__title">보기 방식 선택</div>
            <div className="view-mode-toggle__options">
              <div className="view-mode-toggle__option" onClick={() => setViewMode(ViewModes.STATUS)}>
                <div className={`view-mode-toggle__preview ${isViewModeStatus ? 'view-mode-toggle__preview--active' : 'view-mode-toggle__preview'}`}>
                  <div className="view-mode-toggle__progress">
                    <div className="view-mode-toggle__circle pending" />
                    <div className="view-mode-toggle__line pending" />
                    <div className="view-mode-toggle__circle active" />
                    <div className="view-mode-toggle__line active" />
                    <div className="view-mode-toggle__circle completed" />
                  </div>
                </div>
                <div className="view-mode-toggle__label">상태별</div>
              </div>
              <div className="view-mode-toggle__option" onClick={() => setViewMode(ViewModes.SECTION)}>
                <div className={`view-mode-toggle__preview ${!isViewModeStatus ? 'view-mode-toggle__preview--active' : 'view-mode-toggle__preview'}`}>
                  <div className="view-mode-toggle__folder-layout">
                    <div className="view-mode-toggle__folder-row">
                      <FolderActive width="30" height="30"/>
                      <Folder width="30" height="30"/>
                    </div>
                    <div className="view-mode-toggle__folder-row">
                      <Folder width="30" height="30"/>
                      <Folder width="30" height="30"/>
                    </div>
                  </div>
                </div>
                <div className="view-mode-toggle__label">섹션별</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewModeToggle;