import { useEffect, useState } from "react";
import styled from "styled-components";
import { getNotices, NoticeViewModel } from "./service/notices";

export const App = () => {
    const [notices, setNotices] = useState<NoticeViewModel[]>([])

    useEffect(() => {
        getNotices({ epoch_index: "0" })
            .then(data => {
                setNotices(data);
            })
            .catch(err => {
                window.alert(
                    'An error occuried. Please, try again later.'
                )
            })
    }, [])

    return (
        <AppWrapper>
            <Heading>Hello world</Heading>
            {!!notices.length ?
                <ul>
                    {notices.map((notice, idx) =>

                        <li key={`${notice.notice_index}`}>
                            {notice.payload_parsed}
                        </li>
                    )}
                </ul> :
                <h3>No notices available</h3>
            }
        </AppWrapper>
    );
};

const AppWrapper = styled.div``;
const Heading = styled.h1`
    color: red;
`;
