import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import * as SQLite from "expo-sqlite";
  
  type Event = {
    fecha: string;
    titulo: string;
    descripcion: string;
    id?: number;
  };
  
  type Mode = "Create" | "Update";
  const index = () => {
    const db = SQLite.openDatabaseSync("EmergencyBase.db");
  
    const [events, setEvents] = useState<Event[]>([]);
    const [mode, setMode] = useState<Mode>("Create");
  
    const [eventInfo, setEventInfo] = useState<Event>({
      fecha: "",
      titulo: "",
      descripcion: "",
    });
  
    const selectAll = (table: "events") => {
      try {
        const query = "Select * from " + table;
        const result = db.getAllSync<any>(query);
        return result;
      } catch (err: any) {
        console.error(err.message);
      }
    };
  
    const insertIntoTable = async <T,>(
      table: "events",
      columns: (keyof T)[],
      data: T[]
    ) => {
      try {
        data.forEach((item) => {
          for (const [key, value] of Object.entries(item ?? {})) {
            if (value === undefined || value === null || value === "") {
              throw Error(`${key}, no puede estar vacio`);
            }
          }
        });
  
        let query = `INSERT INTO ${table}(`;
        columns.forEach(
          (col, i) =>
            (query += `${col.toString()}${i !== columns.length - 1 ? "," : ")"}`)
        );
  
        data.forEach((item, i) => {
          if (i == 0) query += " VALUES";
          query += `(${columns.map((col) => `'${item[col]}'`).join(",")})${
            i !== data.length - 1 ? "," : ""
          }`;
        });
  
        db.runSync(query);
      } catch (err: any) {
        console.error(err.message);
      }
    };
  
    const handleDelete = (item: Event) => {
      db.runSync("DELETE FROM events WHERE id = " + item.id);
      setEvents(selectAll("events") ?? []);
    };
  
    useEffect(() => {
      (async () => {
        const events = selectAll("events");
        if (events) setEvents(events);
      })();
    }, []);
  
    return (
      <View>
        <Text
          style={{
            fontSize: 30,
            marginLeft: 14,
            marginBottom: 20,
            marginTop: 20,
          }}
        >
          Eventos:
        </Text>
  
        <View
          style={{ gap: 14, marginBottom: 20, width: 360, alignSelf: "center" }}
        >
          <TextInput
            defaultValue={eventInfo.fecha}
            style={{
              padding: 10,
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 10,
            }}
            placeholder="Ingresa la fecha"
            onChangeText={(txt) => {
              setEventInfo((prev) => ({ ...prev, fecha: txt }));
            }}
          />
          <TextInput
            defaultValue={eventInfo.titulo}
            style={{
              padding: 10,
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 10,
            }}
            placeholder="Ingresa el titulo"
            onChangeText={(txt) => {
              setEventInfo((prev) => ({ ...prev, titulo: txt }));
            }}
          />
          <TextInput
            defaultValue={eventInfo.descripcion}
            style={{
              padding: 10,
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 10,
            }}
            placeholder="Ingresa la descripcion"
            onChangeText={(txt) => {
              setEventInfo((prev) => ({ ...prev, descripcion: txt }));
            }}
          />
  
          <TouchableOpacity
            style={{
              backgroundColor: "green",
              padding: 20,
              borderRadius: 10,
              alignSelf: "center",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={async () => {
              try {
                if (mode === "Create") {
                  await insertIntoTable<Event>(
                    "events",
                    ["fecha", "titulo", "descripcion"],
                    [eventInfo]
                  );
                  setEvents(selectAll("events") ?? []);
                  setEventInfo({ descripcion: "", fecha: "", titulo: "", id: 0 });
                } else {
                  const updateArr: (keyof Event)[] = [
                    "fecha",
                    "titulo",
                    "descripcion",
                  ];
  
                  updateArr.forEach((item) => {
                    db.runSync(
                      `UPDATE events SET ${item} = ? WHERE id = ?`,
                      (eventInfo as Record<string, any>)[item],
                      eventInfo.id ?? 0
                    );
                  });
  
                  setEvents(selectAll("events") ?? []);
                  alert("Evento actualizado exitosamente.");
                  setEventInfo({ descripcion: "", fecha: "", titulo: "", id: 0 });
                  setMode("Create");
                }
              } catch (err: any) {
                console.error(err.message);
              }
            }}
          >
            <Text style={{ color: "white" }}>
              {mode === "Create" ? "Agregar Evento" : "Actualizar Evento"}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: 360,
            alignSelf: "center",
            padding: 10,
            flexDirection: "row",
            gap: 20,
            borderBottomColor: "lightgray",
            borderBottomWidth: 1,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Total: {events.length}
          </Text>
        </View>
        <FlatList
          style={{ height: 420 }}
          data={events}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          ListHeaderComponent={() => <View style={{ height: 16 }} />}
          ListFooterComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item }) => {
            return (
              <View
                style={{
                  borderColor: "black",
                  borderWidth: 1,
                  width: 360,
                  padding: 16,
                  gap: 8,
                  borderRadius: 14,
                  alignSelf: "center",
                  position: "relative",
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "500" }}>
                  {item.titulo}{" "}
                </Text>
                <Text>{item.descripcion} </Text>
  
                <Text
                  style={{
                    width: 100,
                    position: "absolute",
                    right: 0,
                    top: 16,
                  }}
                >
                  {item.fecha}{" "}
                </Text>
  
                <View
                  style={{
                    flexDirection: "row",
                    gap: 20,
                    alignItems: "center",
                    marginTop: 10,
                    alignSelf: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setMode("Update");
                      setEventInfo(item);
                    }}
                    style={{
                      backgroundColor: "#1d759d",
                      padding: 10,
                      borderRadius: 8,
                      width: 155,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white" }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={{
                      backgroundColor: "#ed4048",
                      padding: 10,
                      borderRadius: 8,
                      width: 155,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white" }}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>
    );
  };
  
  export default index;