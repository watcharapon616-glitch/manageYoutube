import { setRecoil } from "recoil-nexus";
import { errorDialog, typeToast } from "../Recoil/MainRecoil";

const handleError = (Message: string) => {
  setRecoil(errorDialog, {
    visible: true,
    message: Message,
    type: typeToast.warning,
  });
};

export { handleError };
