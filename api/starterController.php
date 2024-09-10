<?php

namespace App\Controllers;

use App\Controller;

use Selvi\Exception;
use App\Models\changeNamespaseModel;
use Selvi\Input\Request;

class changeControlController extends Controller { 
    
    function __construct(
      private changeNamespaseModel $changeModel
    ) {}

    function rowException($changeId) {
        $data = $this->changeModel->row([['changeId', $changeId]]);
        if(!$data) throw new Exception('changeControl not found', 'changeControl/not-found', 404);
        return $data;
    }

    function result(Request $request) {
        $order = [];

        $orWhere = [];

        $limit = $request->get('limit') ?? -1;
        $offset = $request->get('offset') ?? 0;
        $where = [];

        return $this->jsonResponse($this->changeModel->result($where, $orWhere, $order, $limit, $offset), [
          'count' => $this->changeModel->count($where, $orWhere)
        ]);
    }

    function row(string $changeId) {
        $data = $this->rowException($changeId);
        return $this->jsonResponse(null, $data, 200);
    }

    function insert(Request $request, ) {
        $data = json_decode($request->raw(), true);

        $error = [];
        if(count($error) > 0) throw new Exception('Periksa kembali isian anda', 'changeControl/invalid-input', 400, $error);

        $changeId = $this->changeModel->insert($data);
        return $this->jsonResponse(null, ['changeId' => $changeId], 201);
    }

    function update(string $changeId, Request $request) {
        $this->rowException($changeId);
        $data = json_decode($request->raw(), true);

        $error = [];
        if(count($error) > 0) throw new Exception('Periksa kembali isian anda', 'changeControl/invalid-input', 400, $error);
        
        $this->changeModel->update([['changeId', $changeId]], $data);
        return $this->jsonResponse(null, 204);
    }

    function delete(string $changeId) {
        $this->rowException($changeId);
        $this->changeModel->delete([['changeId', $changeId]]);
        return $this->jsonResponse(null, 204);
    }

}