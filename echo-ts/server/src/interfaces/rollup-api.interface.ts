export interface Advance {
    'metadata': Metadata;
    'payload'?: string;
}

export interface Exception {
    'payload'?: string;
}

export interface Finish {
    'status': FinishStatusEnum;
}

export const FinishStatusEnum = {
    Accept: 'accept',
    Reject: 'reject'
} as const;

export type FinishStatusEnum = typeof FinishStatusEnum[keyof typeof FinishStatusEnum];

export interface IndexResponse {
    'index': number;
}

export interface Inspect {
    'payload'?: string;
}

export interface Metadata {
    'msg_sender': string;
    'epoch_index': number;
    'input_index': number;
    'block_number': number;
    'timestamp': number;
}

export interface Notice {
    'payload'?: string;
}

export interface Report {
    'payload'?: string;
}

export interface RollupRequest {
    'request_type': RollupRequestRequestTypeEnum;
    'data': Advance | Inspect;
}

export const RollupRequestRequestTypeEnum = {
    AdvanceState: 'advance_state',
    InspectState: 'inspect_state'
} as const;

export type RollupRequestRequestTypeEnum = typeof RollupRequestRequestTypeEnum[keyof typeof RollupRequestRequestTypeEnum];

export interface Voucher {
    'address': string;
    'payload'?: string;
}

