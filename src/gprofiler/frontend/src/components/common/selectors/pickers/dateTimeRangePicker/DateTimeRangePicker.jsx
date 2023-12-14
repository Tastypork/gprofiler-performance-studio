{/*
 * INTEL CONFIDENTIAL
 * Copyright (C) 2023 Intel Corporation
 * This software and the related documents are Intel copyrighted materials, and your use of them is governed by the express license under which they were provided to you ("License"). Unless the License provides otherwise, you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents without Intel's prior written permission.
 * This software and the related documents are provided as is, with no express or implied warranties, other than those that are expressly stated in the License.
*/}

import { InputAdornment, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { DateTimeField } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useEffect, useState } from 'react';

import Icon from '@/components/common/icon/Icon';
import { FullArrowDownIcon } from '@/components/common/icon/Icons';
import { ICONS_NAMES } from '@/components/common/icon/iconsData';
import Flexbox from '@/components/common/layout/Flexbox';
import { COLORS } from '@/theme/colors';
import { formatDate, getCurrentTime, TIME_FORMATS } from '@/utils/datetimesUtils';

const DateTimeRangePicker = ({ onChange, startValueOnPicker, endValueOnPicker }) => {
    const [customStartDatetime, setCustomStartDatetime] = useState(startValueOnPicker);
    const [customEndDatetime, setCustomEndDatetime] = useState(endValueOnPicker);
    useEffect(() => {
        if (onChange && customStartDatetime && customEndDatetime) {
            onChange({ startDate: customStartDatetime, endDate: customEndDatetime });
        }
    }, [customStartDatetime, customEndDatetime, onChange]);

    return (
        <Flexbox sx={{ maxWidth: 625, mt: 4 }} direction='column' spacing={12}>
            <>
                <Flexbox justifyContent='space-between' alignItems='center'>
                    <Flexbox alignItems='center'>
                        <Typography variant='body1'>
                            {formatDate(customStartDatetime, TIME_FORMATS.DATETIME_PRINTED)}
                        </Typography>
                        <FullArrowDownIcon size={32} rotate={-90} />
                        <Typography variant='body1'>
                            {formatDate(customEndDatetime, TIME_FORMATS.DATETIME_PRINTED)}
                        </Typography>
                    </Flexbox>
                    <Flexbox sx={{ color: COLORS.BLACK }}>
                        <Icon name={ICONS_NAMES.Globe} marginRight={3} vertical />
                        <Typography variant='body1_lato'>Local time ({getCurrentTime()})</Typography>
                    </Flexbox>
                </Flexbox>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box sx={{ maxWidth: 625, mt: 6 }}>
                        <Flexbox
                            sx={{ marginTop: -10, marginLeft: 7 }}
                            justifyContent='space-between'
                            alignItems='center'
                            spacing={4}>
                            <Flexbox alignItems='center'>
                                <DateTimeField
                                    label='Start time'
                                    ampm={false}
                                    value={customStartDatetime}
                                    maxDateTime={customEndDatetime}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position='start'>
                                                <Icon name={ICONS_NAMES.Time} width={25} height={25} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'light',
                                        },
                                    }}
                                    format={TIME_FORMATS.DATETIME_PRINTED}
                                    onChange={(newValue) => {
                                        if (newValue && newValue.toString() !== 'Invalid Date') {
                                            setCustomStartDatetime(newValue);
                                        }
                                    }}
                                />
                            </Flexbox>
                            <Flexbox alignItems='space-between' spacing={4}>
                                <DateTimeField
                                    label='End time'
                                    ampm={false}
                                    format={TIME_FORMATS.DATETIME_PRINTED}
                                    value={customEndDatetime}
                                    minDateTime={customStartDatetime}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position='start'>
                                                <Icon name={ICONS_NAMES.Time} width={25} height={25} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        marginRight: 7,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'light',
                                        },
                                    }}
                                    onChange={(newValue) => {
                                        if (newValue && newValue.toString() !== 'Invalid Date') {
                                            setCustomEndDatetime(newValue);
                                        }
                                    }}
                                />
                            </Flexbox>
                        </Flexbox>
                    </Box>
                </LocalizationProvider>
            </>
        </Flexbox>
    );
};

export default DateTimeRangePicker;
