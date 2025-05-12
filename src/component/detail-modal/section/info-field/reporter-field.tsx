import { getInitial } from "../../../../utils/text-function"
import AvatarItem from "../../../avatar/avatar"

const ReporterField: React.FC<{ userName: string }> = ({ userName }) => {
  return (
    <div className="task-detail__detail-modal-info-row">
      <div className="task-detail__detail-modal-info-label">보고자</div>
      <div className="task-detail__detail-modal-info-row--reporter">
        <AvatarItem size={24}>{getInitial(userName)}</AvatarItem>
        <div>{getInitial(userName)}</div>
      </div>
    </div>
  );
};

export default ReporterField;