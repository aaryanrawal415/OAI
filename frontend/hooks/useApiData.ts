import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type {
  AcceptRequest,
  FleetContainerInput,
  FleetDriverInput,
  ManualCargoInput,
  MatchRequest,
  ShipmentAssignment,
} from "../api/types";
import { useAuth } from "../auth/AuthProvider";
import { hasPermission } from "../auth/permissions";
import { canAccessAdminProfile } from "../auth/permissions";
import { useWorkspace } from "../state/WorkspaceContext";

function useToken(): string {
  const { token } = useAuth();
  return token ?? "";
}

export function useRoutes() {
  return useQuery({ queryKey: ["routes"], queryFn: () => api.listRoutes(), staleTime: Infinity });
}

export function useAdminProfile() {
  const token = useToken();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["admin-profile", token],
    queryFn: () => api.getAdminProfile(token),
    enabled: !!token && canAccessAdminProfile(user, api.mode === "http"),
    retry: false,
  });
}

/** Runs a search and stores the result in the workspace. */
export function useRunMatching() {
  const token = useToken();
  const { dispatch } = useWorkspace();
  return useMutation({
    mutationFn: (request: MatchRequest) => api.runMatching(token, request),
    onSuccess: (match, request) => dispatch({ type: "setMatch", match, key: JSON.stringify(request) }),
  });
}

export function useManualCargo() {
  const token = useToken();
  return useQuery({ queryKey: ["manual-cargo", token], queryFn: () => api.listManualCargo(token), enabled: !!token });
}

export function useAddManualCargo() {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ManualCargoInput) => api.addManualCargo(token, input),
    onSuccess: () => client.invalidateQueries({ queryKey: ["manual-cargo"] }),
  });
}

export function useDeleteManualCargo() {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteManualCargo(token, id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["manual-cargo"] }),
  });
}

export function useShipments() {
  const token = useToken();
  return useQuery({ queryKey: ["shipments", token], queryFn: () => api.listShipments(token), enabled: !!token });
}

export function useShipment(id: string | undefined) {
  const token = useToken();
  return useQuery({
    queryKey: ["shipment", token, id],
    queryFn: () => api.getShipment(token, id ?? ""),
    enabled: !!token && !!id,
  });
}

export function useFleetDrivers() {
  const token = useToken();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["fleet-drivers", token],
    queryFn: () => api.listFleetDrivers(token),
    enabled: !!token && hasPermission(user, "fleet:manage"),
  });
}

export function useFleetContainers() {
  const token = useToken();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["fleet-containers", token],
    queryFn: () => api.listFleetContainers(token),
    enabled: !!token && hasPermission(user, "fleet:manage"),
  });
}

export function useAddFleetDriver() {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: FleetDriverInput) => api.addFleetDriver(token, input),
    onSuccess: () => client.invalidateQueries({ queryKey: ["fleet-drivers"] }),
  });
}

export function useDeleteFleetDriver() {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteFleetDriver(token, id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["fleet-drivers"] }),
  });
}

export function useAddFleetContainer() {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: FleetContainerInput) => api.addFleetContainer(token, input),
    onSuccess: () => client.invalidateQueries({ queryKey: ["fleet-containers"] }),
  });
}

export function useUpdateFleetContainer() {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: FleetContainerInput }) => api.updateFleetContainer(token, id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: ["fleet-containers"] }),
  });
}

export function useDeleteFleetContainer() {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteFleetContainer(token, id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["fleet-containers"] }),
  });
}

export function useAcceptCandidate() {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (request: AcceptRequest) => api.acceptCandidate(token, request),
    onSuccess: () => client.invalidateQueries({ queryKey: ["shipments"] }),
  });
}

export function useAssignShipment() {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignment }: { id: string; assignment: ShipmentAssignment }) =>
      api.assignShipment(token, id, assignment),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["shipment"] });
      void client.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
}

export function useShipmentActions(id: string) {
  const token = useToken();
  const client = useQueryClient();
  const refresh = () => {
    void client.invalidateQueries({ queryKey: ["shipment"] });
    void client.invalidateQueries({ queryKey: ["shipments"] });
  };
  const advance = useMutation({ mutationFn: () => api.advanceShipment(token, id), onSuccess: refresh });
  const cancel = useMutation({ mutationFn: () => api.cancelShipment(token, id), onSuccess: refresh });
  return { advance, cancel };
}
