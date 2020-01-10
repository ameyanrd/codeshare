defmodule CodeshareWeb.RoomChannel do
  use CodeshareWeb, :channel
  import Ecto.Query, only: [from: 2]
  alias CodeshareWeb.Presence

  def join("room:" <> room_id, payload, socket) do
    if authorized?(payload) do
      query = from editor in "editor_state",
            select: editor.data
      ops = Codeshare.Repo.all(query)
      send(self(), :after_join)
      {:ok, %{channel: "room:#{room_id}", ops: ops, my_id: socket.assigns.user_id}, assign(socket, :room_id, room_id)}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_info(:after_join, socket) do
    push(socket, "presence_state", Presence.list(socket))
    {:ok, _} = Presence.track(socket, "user_id:#{socket.assigns.user_id}", %{user_id: socket.assigns.user_id})
    {:noreply, socket}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (room:lobby).
  def handle_in("shout", payload, socket) do
    editor = %Codeshare.Editor{}
    changeset = Codeshare.Editor.changeset(editor, %{data: payload})
    Codeshare.Repo.insert(changeset)
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  def handle_in("updateCursor", payload, socket) do
    payload = Map.put(payload, "user_id", socket.assigns.user_id)
    broadcast(socket, "updateCursor", payload)
    {:noreply, socket}
  end

  def handle_in("compile", payload, socket) do
    IO.puts(payload["text"])
    IO.puts(payload["language"])
    case payload["language"] do
        "text/x-csrc" ->
            {:ok, file} = File.open("hello.c", [:write])
            IO.binwrite(file, payload["text"])
            System.cmd("bash",["script.sh"])
            File.close(file)
    end
    {:ok, response}=File.read("output.txt")
    File.rm_rf("hello.c")
    File.rm_rf("output.txt")
    File.rm_rf("a.out")
    {:reply, {:ok,%{response: response}}, socket}
  end

  def terminate(_ , socket) do
    # When last active channel is terminating, 
    # empty the database
    if map_size(Presence.list(socket)) == 1 do
      query = from editor in "editor_state",
            select: editor.data
      Codeshare.Repo.delete_all(query)
    end
    :ok
  end

  defp authorized?(_payload) do
    true
  end
end
