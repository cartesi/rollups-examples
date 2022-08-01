import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AccumulatingEpoch = {
  __typename?: 'AccumulatingEpoch';
  dapp_contract_address: Scalars['String'];
  epoch_number: Scalars['String'];
  id: Scalars['ID'];
  inputs: EpochInputState;
};

export type AccumulatingEpochInput = {
  dapp_contract_address: Scalars['String'];
  epoch_number: Scalars['String'];
  inputs: EpochInputStateInput;
};

export type CartesiMachineHash = {
  __typename?: 'CartesiMachineHash';
  data: Scalars['String'];
};

export enum CompletionStatus {
  Accepted = 'ACCEPTED',
  CycleLimitExceeded = 'CYCLE_LIMIT_EXCEEDED',
  MachineHalted = 'MACHINE_HALTED',
  RejectedByMachine = 'REJECTED_BY_MACHINE',
  TimeLimitExceeded = 'TIME_LIMIT_EXCEEDED'
}

export type EpochInputState = {
  __typename?: 'EpochInputState';
  epoch_number: Scalars['String'];
  id: Scalars['ID'];
  inputs: Array<Maybe<Input>>;
};

export type EpochInputStateInput = {
  epoch_number: Scalars['String'];
  inputs: Array<InputMaybe<InputData>>;
};

export enum EpochState {
  Active = 'ACTIVE',
  Finished = 'FINISHED'
}

export type FinalizedEpoch = {
  __typename?: 'FinalizedEpoch';
  epoch_number: Scalars['String'];
  finalized_block_hash: Scalars['String'];
  finalized_block_number: Scalars['String'];
  hash: Scalars['String'];
  id: Scalars['ID'];
  inputs: EpochInputState;
};

export type FinalizedEpochInput = {
  epoch_number: Scalars['String'];
  finalized_block_hash: Scalars['String'];
  finalized_block_number: Scalars['String'];
  hash: Scalars['String'];
  inputs: EpochInputStateInput;
};

export type FinalizedEpochs = {
  __typename?: 'FinalizedEpochs';
  dapp_contract_address: Scalars['String'];
  finalized_epochs: Array<Maybe<FinalizedEpoch>>;
  id: Scalars['ID'];
  initial_epoch: Scalars['String'];
};

export type FinalizedEpochsInput = {
  dapp_contract_address: Scalars['String'];
  finalized_epochs: Array<InputMaybe<FinalizedEpochInput>>;
  initial_epoch: Scalars['String'];
};

export type GetEpochStatusRequest = {
  epoch_index: Scalars['String'];
  session_id: Scalars['String'];
};

export type GetEpochStatusResponse = {
  __typename?: 'GetEpochStatusResponse';
  epoch_index: Scalars['String'];
  most_recent_machine_hash: Scalars['String'];
  most_recent_notices_epoch_root_hash: Scalars['String'];
  most_recent_vouchers_epoch_root_hash: Scalars['String'];
  pending_input_count: Scalars['String'];
  processed_inputs: Array<Maybe<ProcessedInput>>;
  session_id: Scalars['String'];
  state: EpochState;
  taint_status: TaintStatus;
};

export type GetProcessedInputsVouchersAndNotices = {
  __typename?: 'GetProcessedInputsVouchersAndNotices';
  processed_input?: Maybe<ProcessedInput>;
  report?: Maybe<Report>;
  voucher?: Maybe<Voucher>;
};

export type GetSessionStatusRequest = {
  session_id: Scalars['ID'];
};

export type GetSessionStatusResponse = {
  __typename?: 'GetSessionStatusResponse';
  active_epoch_index: Scalars['Int'];
  epoch_index: Array<Maybe<Scalars['Int']>>;
  session_id: Scalars['ID'];
  taint_status: TaintStatus;
};

export type GetStatusResponse = {
  __typename?: 'GetStatusResponse';
  session_id: Array<Maybe<Scalars['String']>>;
};

export type Hash = {
  __typename?: 'Hash';
  data: Scalars['String'];
};

export type ImmutableState = {
  __typename?: 'ImmutableState';
  challenge_period: Scalars['String'];
  contract_creation_timestamp: Scalars['String'];
  dapp_contract_address: Scalars['String'];
  id: Scalars['ID'];
  input_duration: Scalars['String'];
};

export type ImmutableStateInput = {
  challenge_period: Scalars['String'];
  dapp_contract_address: Scalars['String'];
  input_duration: Scalars['String'];
};

export type Input = {
  __typename?: 'Input';
  id: Scalars['ID'];
  payload: Array<Maybe<Scalars['String']>>;
  sender: Scalars['String'];
  timestamp: Scalars['String'];
};

export type InputData = {
  payload: Array<InputMaybe<Scalars['String']>>;
  sender: Scalars['String'];
  timestamp: Scalars['String'];
};

export type InputResult = {
  __typename?: 'InputResult';
  epoch_index: Scalars['String'];
  input_index: Scalars['String'];
  notice_hashes_in_machine: MerkleTreeProof;
  notices: Array<Maybe<Notice>>;
  session_id: Scalars['String'];
  voucher_hashes_in_machine: MerkleTreeProof;
  vouchers: Array<Maybe<Voucher>>;
};

export type IntegerBool = {
  __typename?: 'IntegerBool';
  integer: Scalars['Boolean'];
};

export type IntegerBoolInput = {
  integer: Scalars['Boolean'];
};

export type IntegerInnerObject = {
  __typename?: 'IntegerInnerObject';
  integer?: Maybe<IntegerBool>;
};

export type IntegerInnerObjectInput = {
  integer: IntegerBoolInput;
};

export type IntegerObject = {
  __typename?: 'IntegerObject';
  integer?: Maybe<IntegerInnerObject>;
};

export type IntegerObjectInput = {
  integer: IntegerInnerObjectInput;
};

export type Keys = {
  epoch_index?: InputMaybe<Scalars['String']>;
  input_index?: InputMaybe<Scalars['String']>;
  session_id?: InputMaybe<Scalars['String']>;
};

export type MerkleTreeProof = {
  __typename?: 'MerkleTreeProof';
  id: Scalars['ID'];
  log2_root_size: Scalars['String'];
  log2_target_size: Scalars['String'];
  root_hash: Scalars['String'];
  sibling_hashes: Array<Maybe<Array<Maybe<Scalars['Int']>>>>;
  target_address: Scalars['String'];
  target_hash: Scalars['String'];
};

export type Metrics = {
  __typename?: 'Metrics';
  block_hash?: Maybe<Scalars['String']>;
  block_number?: Maybe<Scalars['String']>;
  dapp_contract_address?: Maybe<Scalars['String']>;
  number_of_processed_inputs?: Maybe<Scalars['Int']>;
  prometheus_metrics?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  RollupsState: RollupsState;
  constants: Array<Maybe<ImmutableState>>;
  current_epoch: AccumulatingEpoch;
  current_phase: PhaseState;
  finalized_epochs: Array<Maybe<FinalizedEpochs>>;
  initial_epoch: Scalars['String'];
  voucher_state: VoucherState;
};


export type MutationRollupsStateArgs = {
  input: RollupsInput;
};


export type MutationConstantsArgs = {
  input: Array<InputMaybe<ImmutableStateInput>>;
};


export type MutationCurrent_EpochArgs = {
  input: AccumulatingEpochInput;
};


export type MutationCurrent_PhaseArgs = {
  input: PhaseState;
};


export type MutationFinalized_EpochsArgs = {
  input: Array<InputMaybe<FinalizedEpochsInput>>;
};


export type MutationInitial_EpochArgs = {
  input: Scalars['String'];
};


export type MutationVoucher_StateArgs = {
  input: VoucherStateInput;
};

export type Notice = {
  __typename?: 'Notice';
  epoch_index: Scalars['String'];
  input_index: Scalars['String'];
  keccak: Scalars['String'];
  keccak_in_notice_hashes: MerkleTreeProof;
  notice_index: Scalars['String'];
  payload: Scalars['String'];
  session_id: Scalars['String'];
};

export type NoticeKeys = {
  epoch_index?: InputMaybe<Scalars['String']>;
  input_index?: InputMaybe<Scalars['String']>;
  notice_index?: InputMaybe<Scalars['String']>;
  session_id?: InputMaybe<Scalars['String']>;
};

export enum PhaseState {
  AwaitingConsensusAfterConflict = 'AwaitingConsensusAfterConflict',
  AwaitingConsensusNoConflict = 'AwaitingConsensusNoConflict',
  AwaitingDispute = 'AwaitingDispute',
  ConsensusTimeout = 'ConsensusTimeout',
  EpochSealedAwaitingFirstClaim = 'EpochSealedAwaitingFirstClaim',
  InputAccumulation = 'InputAccumulation'
}

export type ProcessedInput = {
  __typename?: 'ProcessedInput';
  epoch_index: Scalars['String'];
  input_index: Scalars['String'];
  most_recent_machine_hash: Scalars['String'];
  notice_hashes_in_epoch: MerkleTreeProof;
  reports: Array<Maybe<Report>>;
  result?: Maybe<InputResult>;
  session_id: Scalars['String'];
  skip_reason?: Maybe<CompletionStatus>;
  voucher_hashes_in_epoch: MerkleTreeProof;
};

export type Query = {
  __typename?: 'Query';
  GetEpochStatus: GetEpochStatusResponse;
  GetNotice?: Maybe<Array<Maybe<Notice>>>;
  GetProcessedInput?: Maybe<Array<Maybe<ProcessedInput>>>;
  GetSessionStatus: GetSessionStatusResponse;
  GetStatus: GetStatusResponse;
  GetVersion: Version;
  GetVoucher?: Maybe<Array<Maybe<Voucher>>>;
  RollupsState: Array<Maybe<RollupsState>>;
  constants: Array<Maybe<ImmutableState>>;
  current_epoch: Array<Maybe<AccumulatingEpoch>>;
  current_phase: Array<Maybe<PhaseState>>;
  finalized_epochs: Array<Maybe<FinalizedEpochs>>;
  getMetrics?: Maybe<Metrics>;
  initial_epoch: Scalars['String'];
  voucher_state: Array<Maybe<VoucherState>>;
};


export type QueryGetEpochStatusArgs = {
  query: GetEpochStatusRequest;
};


export type QueryGetNoticeArgs = {
  query?: InputMaybe<NoticeKeys>;
};


export type QueryGetProcessedInputArgs = {
  query?: InputMaybe<Keys>;
};


export type QueryGetSessionStatusArgs = {
  query: GetSessionStatusRequest;
};


export type QueryGetVoucherArgs = {
  query?: InputMaybe<VoucherKeys>;
};

export type Report = {
  __typename?: 'Report';
  payload: Scalars['String'];
};

export type RollupsInput = {
  block_hash: Scalars['String'];
  constants: ImmutableStateInput;
  current_epoch: AccumulatingEpochInput;
  current_phase: PhaseState;
  initial_epoch: Scalars['String'];
  voucher_state: VoucherStateInput;
};

export type RollupsState = {
  __typename?: 'RollupsState';
  block_hash: Scalars['String'];
  constants: ImmutableState;
  current_epoch: AccumulatingEpoch;
  current_phase: PhaseState;
  id: Scalars['ID'];
  initial_epoch: Scalars['String'];
  voucher_state: VoucherState;
};

export type TaintStatus = {
  __typename?: 'TaintStatus';
  error_code: Scalars['Int'];
  error_message: Scalars['String'];
};

export type Version = {
  __typename?: 'Version';
  id: Scalars['Int'];
  version: Scalars['String'];
};

export type Voucher = {
  __typename?: 'Voucher';
  Address: Scalars['String'];
  epoch_index: Scalars['String'];
  input_index: Scalars['String'];
  keccak: Scalars['String'];
  keccak_in_voucher_hashes: MerkleTreeProof;
  payload: Scalars['String'];
  session_id: Scalars['String'];
  voucher_index: Scalars['String'];
};

export type VoucherKeys = {
  epoch_index?: InputMaybe<Scalars['String']>;
  input_index?: InputMaybe<Scalars['String']>;
  session_id?: InputMaybe<Scalars['String']>;
  voucher_index?: InputMaybe<Scalars['String']>;
};

export type VoucherState = {
  __typename?: 'VoucherState';
  id: Scalars['ID'];
  voucher_address: Scalars['String'];
  vouchers?: Maybe<IntegerObject>;
};

export type VoucherStateInput = {
  voucher_address: Scalars['String'];
  vouchers: IntegerObjectInput;
};

export type GetNoticeQueryVariables = Exact<{
  query?: InputMaybe<NoticeKeys>;
}>;


export type GetNoticeQuery = { __typename?: 'Query', GetNotice?: Array<{ __typename?: 'Notice', session_id: string, epoch_index: string, input_index: string, notice_index: string, payload: string } | null> | null };


export const GetNoticeDocument = gql`
    query GetNotice($query: NoticeKeys) {
  GetNotice(query: $query) {
    session_id
    epoch_index
    input_index
    notice_index
    payload
  }
}
    `;

/**
 * __useGetNoticeQuery__
 *
 * To run a query within a React component, call `useGetNoticeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNoticeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNoticeQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetNoticeQuery(baseOptions?: Apollo.QueryHookOptions<GetNoticeQuery, GetNoticeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNoticeQuery, GetNoticeQueryVariables>(GetNoticeDocument, options);
      }
export function useGetNoticeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNoticeQuery, GetNoticeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNoticeQuery, GetNoticeQueryVariables>(GetNoticeDocument, options);
        }
export type GetNoticeQueryHookResult = ReturnType<typeof useGetNoticeQuery>;
export type GetNoticeLazyQueryHookResult = ReturnType<typeof useGetNoticeLazyQuery>;
export type GetNoticeQueryResult = Apollo.QueryResult<GetNoticeQuery, GetNoticeQueryVariables>;