/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faEllipsisV,
  faExchangeAlt,
  faMapPin,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import { CardTypeAllInOne as CardType } from '../../../types/cardTypeDefinition';
import ConfirmDeleteModal from '../../common/layout/ConfirmDeleteModal';
import DropDownMenu, { modalEntryStyle } from '../../common/layout/DropDownMenu';
import Flex from '../../common/layout/Flex';
import { DocTextDisplay } from '../../documents/DocTextItem';
import {
  borderRadius,
  cardShadow,
  errorColor,
  lightIconButtonStyle,
  lightItalicText,
  space_M,
  space_S,
} from '../../styling/style';
import CardTypeRelativesSummary from './summary/CardTypeRelativesSummary';
import { TagsDisplay } from './tags/TagsDisplay';

const style = css({
  width: '280px',
  borderRadius: borderRadius,
  padding: space_M,
  background: 'var(--bgColor)',
  boxShadow: cardShadow,
});

const tagStyle = css({
  borderRadius: '13px',
  padding: space_S + ' ' + space_M,
  marginRight: space_S,
  backgroundColor: 'var(--lightGray)',
  fontSize: '0.8em',
});

interface CardTypeItemProps {
  cardType: CardType;
  usage: 'currentProject' | 'available' | 'global';
}

export default function CardTypeItem({ cardType, usage }: CardTypeItemProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const editedProject = useProjectBeingEdited().project;
  const editedProjectId = editedProject?.id;

  return (
    <Flex direction="column" align="stretch" className={style}>
      <Flex justify="space-between">
        <h3>{cardType.title || i18n.modules.cardType.cardType}</h3>
        <DropDownMenu
          icon={faEllipsisV}
          valueComp={{ value: '', label: '' }}
          buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: '40px' }))}
          entries={[
            ...((usage === 'currentProject' && cardType.projectId === editedProjectId) ||
            usage === 'global'
              ? [
                  {
                    value: 'Edit type',
                    label: (
                      <>
                        <FontAwesomeIcon icon={faPen} />
                        {i18n.modules.cardType.editType}
                      </>
                    ),
                    action: () => navigate(`./edit/${cardType.ownId}`),
                  },
                ]
              : []),
            ...(usage === 'available' && editedProject && cardType.projectId !== editedProjectId
              ? [
                  {
                    value: 'Use this type in the project',
                    label: (
                      <>
                        <FontAwesomeIcon icon={faMapPin} /> {i18n.modules.cardType.useInProject}
                      </>
                    ),
                    action: () =>
                      dispatch(API.addCardTypeToProject({ cardType, project: editedProject })),
                  },
                ]
              : []),
            .../*!readOnly &&*/
            (usage === 'currentProject' &&
            editedProject &&
            cardType.projectId === editedProjectId &&
            cardType.kind === 'referenced'
              ? [
                  {
                    value: 'Remove this type from the project',
                    label: (
                      <>
                        <FontAwesomeIcon icon={faExchangeAlt} />
                        {i18n.modules.cardType.RmFromProject}
                      </>
                    ),
                    action: () =>
                      dispatch(
                        API.removeCardTypeRefFromProject({ cardType, project: editedProject }),
                      ),
                  },
                ]
              : []),
            .../*!readOnly &&*/
            (cardType.kind === 'own' &&
            ((usage === 'currentProject' && cardType.projectId === editedProjectId) ||
              usage === 'global')
              ? [
                  {
                    value: 'Delete type',
                    label: (
                      <ConfirmDeleteModal
                        buttonLabel={
                          <div className={cx(css({ color: errorColor }), modalEntryStyle)}>
                            <FontAwesomeIcon icon={faTrash} />
                            {i18n.modules.cardType.deleteType}
                          </div>
                        }
                        className={css({
                          '&:hover': { textDecoration: 'none' },
                          display: 'flex',
                          alignItems: 'center',
                        })}
                        message={<p>{i18n.modules.cardType.confirmDeleteType}</p>}
                        onConfirm={() => dispatch(API.deleteCardType(cardType))}
                        confirmButtonLabel={i18n.modules.cardType.deleteType}
                      />
                    ),
                    modal: true,
                  },
                ]
              : []),
          ]}
        />
      </Flex>
      <Flex grow={1}>
        <p className={lightItalicText}>
          <DocTextDisplay id={cardType.purposeId} />
        </p>
      </Flex>
      <Flex>
        <CardTypeRelativesSummary cardType={cardType} />
      </Flex>
      <Flex>
        <TagsDisplay tags={cardType.tags} className={tagStyle} />
      </Flex>
    </Flex>
  );
}
