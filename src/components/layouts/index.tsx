import { Layout as AntdLayout } from "antd";
import { HeaderCustom } from "./header";
const { Header, Content } = AntdLayout;
import "../../assets/scss/layout.scss"
import Footer from "./footer";
import { Outlet } from "react-router-dom";


export function MainLayout() {
    return (
        <>
            <AntdLayout className="Layout"  >
                <Header className="Layout__header" ><HeaderCustom /></Header>
                <Content className="layout__content">
                    <Outlet />
                </Content>
                <div className="Layout__banner">
                    <div className="Layout__banner__content">
                        <h1 className="left" >ultimate</h1>
                        <div className="right">
                            <img
                                className="img"
                                src="../../../public/images/circle.png"
                                alt="Circle Image"
                                width={416}
                                height={416}
                            />
                            <img
                                className="img"
                                src="../../../public/images/circle.png"
                                alt="Circle Image"
                                width={416}
                                height={416}
                            />
                            <img className="img"
                                src="../../../public/images/circle.png"
                                alt="Cirlce Image"
                                width={416}
                                height={416}

                            />
                            <div className="subtitle">
                                <h5>Trendy Slick pro</h5>
                                <p>$120</p>
                            </div>
                        </div>
                    </div>
                    <img className="shoe" width={971} height={588} src="../../../public/images/herobaner.png" alt="Banner Image" />
                </div>

                <Footer />
            </AntdLayout>
        </>
    )
}
