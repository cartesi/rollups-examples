import { useEffect, useState } from "react";
import styled from "styled-components";
import { fetchNotices } from "./controller/use-service/use-service.functions";
import { useService } from "./controller/use-service/use-service.hook";
import { getNotices, NoticeViewModel } from "./service/notices";

export const App = () => {
    const [
        { data, error, status },
        dispatch
    ] = useService<NoticeViewModel[]>();

    useEffect(() => {
        fetchNotices(dispatch)
    }, [])

    return (
        <AppWrapper>
            <Heading>Hello world</Heading>
            {!!data?.length ? (
                <ul>
                    {data.map((notice, idx) => (
                        <li key={`${notice.notice_index}`}>
                            {notice.payload_parsed}
                        </li>
                    ))}
                </ul>
            ) : (
                <h3>No notices available</h3>
            )}
        </AppWrapper>
    );
};

const AppWrapper = styled.div``;
const Heading = styled.h1`
    color: red;
`;
