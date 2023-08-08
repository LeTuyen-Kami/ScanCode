//
// Created by Vietdev Studio on 18/07/2023.
//

import Foundation

class Utils {
    static func structToJson<T: Encodable>(structObject: T) -> String? {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted

        do {
            let jsonData = try encoder.encode(structObject)
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                return jsonString
            }
        } catch {
            print("Error encoding struct to JSON: \(error)")
        }

        return nil
    }
    static func jsonArray<T: Encodable>(array: [T]) -> String? {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted

        var jsonArray: [String] = []

        for object in array {
            do {
                let jsonData = try encoder.encode(object)
                if let jsonString = String(data: jsonData, encoding: .utf8) {
                    jsonArray.append(jsonString)
                }
            } catch {
                print("Error encoding object to JSON: \(error)")
            }
        }

        return "[\n" + jsonArray.joined(separator: ",\n") + "\n]"
    }

}