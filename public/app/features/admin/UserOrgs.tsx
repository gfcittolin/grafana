import React, { PureComponent } from 'react';
import { css, cx } from 'emotion';
import { Modal, Themeable, stylesFactory, withTheme, ConfirmButton, Button } from '@grafana/ui';
import { GrafanaTheme } from '@grafana/data';
import { UserOrg, Organization, OrgRole } from 'app/types';
import { OrgPicker, OrgSelectItem } from 'app/core/components/Select/OrgPicker';
import { OrgRolePicker } from './OrgRolePicker';

interface Props {
  orgs: UserOrg[];

  onOrgRemove: (orgId: number) => void;
  onOrgRoleChange: (orgId: number, newRole: OrgRole) => void;
  onOrgAdd: (orgId: number, role: OrgRole) => void;
}

interface State {
  showAddOrgModal: boolean;
}

export class UserOrgs extends PureComponent<Props, State> {
  state = {
    showAddOrgModal: false,
  };

  showOrgAddModal = (show: boolean) => () => {
    this.setState({ showAddOrgModal: show });
  };

  render() {
    const { orgs, onOrgRoleChange, onOrgRemove, onOrgAdd } = this.props;
    const { showAddOrgModal } = this.state;
    const addToOrgContainerClass = css`
      margin-top: 0.8rem;
    `;

    return (
      <>
        <h3 className="page-heading">Organisations</h3>
        <div className="gf-form-group">
          <div className="gf-form">
            <table className="filter-table form-inline">
              <tbody>
                {orgs.map((org, index) => (
                  <OrgRow
                    key={`${org.orgId}-${index}`}
                    org={org}
                    onOrgRoleChange={onOrgRoleChange}
                    onOrgRemove={onOrgRemove}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className={addToOrgContainerClass}>
            <Button variant="secondary" onClick={this.showOrgAddModal(true)}>
              Add user to organization
            </Button>
          </div>
          <AddToOrgModal isOpen={showAddOrgModal} onOrgAdd={onOrgAdd} onDismiss={this.showOrgAddModal(false)} />
        </div>
      </>
    );
  }
}

const getOrgRowStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    removeButton: css`
      margin-right: 0.6rem;
      text-decoration: underline;
      color: ${theme.colors.blue95};
    `,
    label: css`
      font-weight: 500;
    `,
  };
});

interface OrgRowProps extends Themeable {
  org: UserOrg;
  onOrgRemove: (orgId: number) => void;
  onOrgRoleChange: (orgId: number, newRole: string) => void;
}

interface OrgRowState {
  currentRole: OrgRole;
  isChangingRole: boolean;
  isRemovingFromOrg: boolean;
}

class UnThemedOrgRow extends PureComponent<OrgRowProps, OrgRowState> {
  state = {
    currentRole: this.props.org.role,
    isChangingRole: false,
    isRemovingFromOrg: false,
  };

  onOrgRemove = () => {
    const { org } = this.props;
    this.props.onOrgRemove(org.orgId);
  };

  onChangeRoleClick = () => {
    const { org } = this.props;
    this.setState({ isChangingRole: true, currentRole: org.role });
  };

  onOrgRemoveClick = () => {
    this.setState({ isRemovingFromOrg: true });
  };

  onOrgRoleChange = (newRole: OrgRole) => {
    this.setState({ currentRole: newRole });
  };

  onOrgRoleSave = () => {
    this.props.onOrgRoleChange(this.props.org.orgId, this.state.currentRole);
  };

  onCancelClick = () => {
    this.setState({ isChangingRole: false, isRemovingFromOrg: false });
  };

  render() {
    const { org, theme } = this.props;
    const { currentRole, isChangingRole, isRemovingFromOrg } = this.state;
    const styles = getOrgRowStyles(theme);
    const labelClass = cx('width-16', styles.label);

    return (
      <tr>
        <td className={labelClass}>{org.name}</td>
        {isChangingRole ? (
          <td>
            <div className="gf-form-select-wrapper width-8">
              <OrgRolePicker value={currentRole} onChange={this.onOrgRoleChange} />
            </div>
          </td>
        ) : (
          <td className="width-25">{org.role}</td>
        )}
        {!isRemovingFromOrg && (
          <td colSpan={isChangingRole ? 2 : 1}>
            <div className="pull-right">
              <ConfirmButton
                confirmText="Save"
                onClick={this.onChangeRoleClick}
                onCancel={this.onCancelClick}
                onConfirm={this.onOrgRoleSave}
              >
                Change role
              </ConfirmButton>
            </div>
          </td>
        )}
        {!isChangingRole && (
          <td colSpan={isRemovingFromOrg ? 2 : 1}>
            <div className="pull-right">
              <ConfirmButton
                confirmText="Confirm removal"
                confirmVariant="destructive"
                onClick={this.onOrgRemoveClick}
                onCancel={this.onCancelClick}
                onConfirm={this.onOrgRemove}
              >
                <Button variant="destructive" icon="fa fa-remove" size="sm" />
              </ConfirmButton>
            </div>
          </td>
        )}
      </tr>
    );
  }
}

const OrgRow = withTheme(UnThemedOrgRow);

const getAddToOrgModalStyles = stylesFactory(() => ({
  modal: css`
    width: 500px;
  `,
  buttonRow: css`
    text-align: center;
  `,
}));

interface AddToOrgModalProps {
  isOpen: boolean;
  onOrgAdd(orgId: number, role: string): void;
  onDismiss?(): void;
}

interface AddToOrgModalState {
  selectedOrg: Organization;
  role: OrgRole;
}

export class AddToOrgModal extends PureComponent<AddToOrgModalProps, AddToOrgModalState> {
  state: AddToOrgModalState = {
    selectedOrg: null,
    role: OrgRole.Admin,
  };

  onOrgSelect = (org: OrgSelectItem) => {
    this.setState({ selectedOrg: { ...org } });
  };

  onOrgRoleChange = (newRole: OrgRole) => {
    this.setState({
      role: newRole,
    });
  };

  onAddUserToOrg = () => {
    const { selectedOrg, role } = this.state;
    this.props.onOrgAdd(selectedOrg.id, role);
  };

  onCancel = () => {
    this.props.onDismiss();
  };

  render() {
    const { isOpen } = this.props;
    const { role } = this.state;
    const styles = getAddToOrgModalStyles();
    const buttonRowClass = cx('gf-form-button-row', styles.buttonRow);

    return (
      <Modal className={styles.modal} title="Add to an organization" isOpen={isOpen} onDismiss={this.onCancel}>
        <div className="gf-form-group">
          <h6 className="">Organisation</h6>
          <OrgPicker onSelected={this.onOrgSelect} />
        </div>
        <div className="gf-form-group">
          <h6 className="">Role</h6>
          <div className="gf-form-select-wrapper width-16">
            <OrgRolePicker value={role} onChange={this.onOrgRoleChange} />
          </div>
        </div>
        <div className={buttonRowClass}>
          <Button variant="primary" onClick={this.onAddUserToOrg}>
            Add to organization
          </Button>
          <Button variant="secondary" onClick={this.onCancel}>
            Cancel
          </Button>
        </div>
      </Modal>
    );
  }
}
