import React, { Component } from 'react';
import { View, Text } from 'react-native';
import isEmpty from 'lodash/isEmpty';

import { OfferCreate } from '@common/libs/ledger/transactions';
import { getAccountName, AccountNameType } from '@common/helpers/resolver';

import { RecipientElement } from '@components/Modules';

import { FormatDate, NormalizeCurrencyCode } from '@common/libs/utils';

import Localize from '@locale';


import styles from './styles';

/* types ==================================================================== */
export interface Props {
    transaction: OfferCreate;
}

export interface State {
    takerGetsIssuerDetails: AccountNameType;
    takerPaysIssuerDetails: AccountNameType;
    isLoading: boolean;
}

/* Component ==================================================================== */
class OfferCreateTemplate extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            takerGetsIssuerDetails: undefined,
            takerPaysIssuerDetails: undefined,
            isLoading: false,
        };
    }

    componentDidMount() {
        const { transaction } = this.props;

        this.setState({
            isLoading: true,
        });

        if (transaction.TakerGets.issuer) {
            getAccountName(transaction.TakerGets.issuer)
                .then((res: any) => {
                    if (!isEmpty(res)) {
                        this.setState({
                            takerGetsIssuerDetails: res,
                        });
                    }
                })
                .catch(() => {
                    // ignore
                })
                .finally(() => {
                    this.setState({
                        isLoading: false,
                    });
                });
        }

        if (transaction.TakerPays.issuer) {
            getAccountName(transaction.TakerPays.issuer)
                .then((res: any) => {
                    if (!isEmpty(res)) {
                        this.setState({
                            takerPaysIssuerDetails: res,
                        });
                    }
                })
                .catch(() => {
                    // ignore
                })
                .finally(() => {
                    this.setState({
                        isLoading: false,
                    });
                });
        }
    }

    render() {
        const { transaction } = this.props;
        const { takerGetsIssuerDetails, takerPaysIssuerDetails, isLoading } = this.state;

        return (
            <>
                <Text style={[styles.label]}>{Localize.t('global.selling')}</Text>
                <View style={[styles.contentBox]}>
                    <Text style={[styles.amount]}>
                        {`${transaction.TakerGets.value} ${NormalizeCurrencyCode(transaction.TakerGets.currency)}`}
                    </Text>
                </View>


                <Text style={[styles.label]}>{Localize.t('global.inExchangeForReceive')}</Text>
                <View style={[styles.contentBox]}>
                    <Text style={[styles.amount]}>
                        {`${transaction.TakerPays.value} ${NormalizeCurrencyCode(transaction.TakerPays.currency)}`}
                    </Text>
                </View>

                <Text style={[styles.label]}>{Localize.t('global.issuer')}</Text>
                <RecipientElement
                    containerStyle={[styles.contentBox, styles.addressContainer]}
                    isLoading={isLoading}
                    showAvatar={false}
                    recipient={{
                        address: transaction.TakerGets.issuer || transaction.TakerPays.issuer,
                        ...takerGetsIssuerDetails || takerPaysIssuerDetails,
                    }}
                />

                {transaction.Expiration && (
                    <>
                        <Text style={[styles.label]}>{Localize.t('global.expireAfter')}</Text>
                        <View style={[styles.contentBox]}>
                            <Text style={[styles.value]}>{FormatDate(transaction.Expiration)}</Text>
                        </View>
                    </>
                )}

                {transaction.OfferSequence && (
                    <>
                        <Text style={[styles.label]}>{Localize.t('global.offerSequence')}</Text>
                        <View style={[styles.contentBox]}>
                            <Text style={styles.value}>{transaction.OfferSequence}</Text>
                        </View>
                    </>
                )}
            </>
        );
    }
}

export default OfferCreateTemplate;
