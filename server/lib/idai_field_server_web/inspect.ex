defmodule IdaiFieldServerWeb.Plug.Inspect do
  def init(default), do: default

  def call(conn, _default) do
    IO.inspect conn
    conn
  end
end
