import { Link } from "react-router-dom";
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/bundle';
import slide1 from "../../../images/slide1.png";
import m_slide1 from "../../../images/m_slide1.png";


const MainVisual = () => {
    return(<>
        <div className="main_visual">
            <Swiper 
                className="main_slider"
                modules={[Navigation]}
                loop={true}
                navigation={{nextEl: ".main_slider .swiper-button-next",prevEl: ".main_slider .swiper-button-prev"}}
            >
                <SwiperSlide>
                    <Link to="/">
                        <div className="img">
                            <img src={slide1} alt="image"/>
                        </div>
                        <div className="m_img">
                            <img src={m_slide1} alt="image"/>
                        </div>
                    </Link>
                </SwiperSlide>
                <SwiperSlide>
                    <Link to="/">
                        <div className="img">
                            <img src={slide1} alt="image"/>
                        </div>
                        <div className="m_img">
                            <img src={m_slide1} alt="image"/>
                        </div>
                    </Link>
                </SwiperSlide>
                <div className="btn_wrap">
                    <div className="swiper-button-prev btn_arrow"></div>
                    <div className="swiper-button-next btn_arrow"></div>
                </div>
            </Swiper>
        </div>
    </>);
};

export default MainVisual;