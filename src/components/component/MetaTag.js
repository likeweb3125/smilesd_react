import { Helmet } from 'react-helmet-async';

const MetaTag = (props) => {
    return(
        <Helmet>
            <meta name="title" content={props.info.c_b_title}/>
            <meta name="description" content={props.info.c_meta} />
            <meta name="robots" content="index,follow" />
            <meta name="keywords" content={props.info.c_meta_tag} />
            <meta property="og:type" content="website"/>
            <meta property="og:title" content={props.info.c_b_title} /> 
            <meta property="og:description" content={props.info.c_meta} /> 
            <meta property="og:type" content="website" /> 
            <meta property="og:url" content="http://www.clearlasik.kr/" />
            <meta property="og:image" content="http://www.clearlasik.kr/thumbnail.png" />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={props.info.c_b_title} />
            <meta name="twitter:description" content={props.info.c_meta} />
            <meta name="twitter:image" content="http://www.clearlasik.kr/thumbnail.png" />
            <title>{props.info.c_b_title}</title>
        </Helmet>
    );
};

export default MetaTag;