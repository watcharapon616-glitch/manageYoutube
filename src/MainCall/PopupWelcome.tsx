import { Popup } from "devextreme-react";
import { useState } from "react";
import Beta from "../image/Beta.png";
import { ReactComponent as Logo } from "../image/SVG_Memorybox/Home instruction/Symbol.svg";
export default function PopupWelcome(props) {
    return (
        <Popup
            position="center"
            visible={props.data}
            closeOnOutsideClick={true}
            onHiding={props.done}
            width="70%"
            height={"auto"}
            showTitle={false}
        >
            <div className="grid grid-cols-12">
                <div className="grid col-span-12  sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 content-center mb-5">
                    <div className='text-center'><div className='text-xl font-semibold text-[#000000B2]'>WELCOME</div></div>
                </div>
                <div className="grid col-span-12  sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 content-center">
                    <Logo className="inline h-[auto] w-[70px] center" />
                </div>
                <div className="grid col-span-12  sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 content-center justify-center">
                    <img src={Beta} className="w-8 h-[auto] ml-28"></img>
                </div>
                <div className="grid col-span-12  sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 content-center mb-5">
                    <div className='text-center'><div className='text-sm font-semibold text-[#000000B2]'>Memmory Box</div></div>
                </div>
                <div className="grid col-span-12  sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 content-center mb-5">
                    <div className='text-center'><div className='text-xs text-[#000000B2]'>Digital marketplace with face.</div></div>
                    <div className='text-center'><div className='text-xs text-[#000000B2]'>recognition technology.</div></div>
                </div>
                <div className="grid col-span-12  sm:col-span-12 md:col-span-12 lg:col-span-12 xl:col-span-12 content-center justify-center">
                    <button className="btn-save w-40" onClick={props.toggle}>
                        <div className="text-lg">Get started</div>
                    </button>
                </div>
            </div>
        </Popup>
    )
};