import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import AddressBookManager from "../components/AddressBookManager";
import ProfileSummaryCard from "../components/ProfileSummaryCard";
import { apiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";

const initialAddressForm = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const mapAddressToForm = (address) => ({
  label: address.label || "Home",
  fullName: address.fullName || "",
  phone: address.phone || "",
  line1: address.line1 || "",
  line2: address.line2 || "",
  city: address.city || "",
  state: address.state || "",
  postalCode: address.postalCode || "",
  country: address.country || "India",
});

const Account = () => {
  const { user, token, updateProfile } = useAuth();
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileStatus, setProfileStatus] = useState({ type: "", message: "" });
  const [addressStatus, setAddressStatus] = useState({ type: "", message: "" });
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  useEffect(() => {
    setProfileName(user?.name || "");
  }, [user]);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await axios.get(apiUrl("/api/addresses"), {
        headers: authHeaders,
      });
      setAddresses(response.data.addresses || []);
    } catch (error) {
      setAddressStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to load address book.",
      });
    }
  }, [authHeaders]);

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [fetchAddresses, token]);

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm(initialAddressForm);
    setIsDefaultAddress(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus({ type: "", message: "" });

    try {
      const response = await updateProfile({ name: profileName });
      setProfileStatus({ type: "success", message: response.message });
    } catch (error) {
      setProfileStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to update profile.",
      });
    }
  };

  const handleAddressSubmit = async () => {
    setAddressStatus({ type: "", message: "" });

    try {
      const payload = {
        ...addressForm,
        isDefault: isDefaultAddress,
      };

      const response = editingAddressId
        ? await axios.put(apiUrl(`/api/addresses/${editingAddressId}`), payload, {
            headers: authHeaders,
          })
        : await axios.post(apiUrl("/api/addresses"), payload, {
            headers: authHeaders,
          });

      setAddressStatus({ type: "success", message: response.data.message });
      resetAddressForm();
      fetchAddresses();
    } catch (error) {
      setAddressStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to save address.",
      });
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Delete this address from your account?")) {
      return;
    }

    try {
      const response = await axios.delete(apiUrl(`/api/addresses/${addressId}`), {
        headers: authHeaders,
      });
      setAddressStatus({ type: "success", message: response.data.message });
      if (editingAddressId === addressId) {
        resetAddressForm();
      }
      fetchAddresses();
    } catch (error) {
      setAddressStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to delete address.",
      });
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await axios.patch(
        apiUrl(`/api/addresses/${addressId}/default`),
        {},
        { headers: authHeaders }
      );
      setAddressStatus({ type: "success", message: response.data.message });
      fetchAddresses();
    } catch (error) {
      setAddressStatus({
        type: "error",
        message: error.response?.data?.message || "Unable to update default address.",
      });
    }
  };

  return (
    <div className="page-shell">
      <section className="container section-space">
        <div className="section-heading">
          <span className="eyebrow">Account</span>
          <h1>Manage your FAISHORA profile and addresses</h1>
          <p>Keep your personal details current and maintain a clean address book for faster future checkout.</p>
        </div>

        <div className="account-layout">
          <ProfileSummaryCard
            name={profileName}
            email={user?.email || ""}
            status={profileStatus}
            onChange={(e) => setProfileName(e.target.value)}
            onSubmit={handleProfileSubmit}
          />

          <AddressBookManager
            addresses={addresses}
            formData={addressForm}
            status={addressStatus}
            editingAddressId={editingAddressId}
            isDefault={isDefaultAddress}
            onChange={(e) =>
              setAddressForm((current) => ({
                ...current,
                [e.target.name]: e.target.value,
              }))
            }
            onToggleDefault={() => setIsDefaultAddress((current) => !current)}
            onSubmit={handleAddressSubmit}
            onEdit={(address) => {
              setEditingAddressId(address.id);
              setAddressForm(mapAddressToForm(address));
              setIsDefaultAddress(Boolean(address.isDefault));
            }}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
            onCancel={resetAddressForm}
          />
        </div>
      </section>
    </div>
  );
};

export default Account;
